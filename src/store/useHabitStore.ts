import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
}

export interface DailyLog {
  [date: string]: string[];
}

interface HabitState {
  habits: Habit[];
  logs: DailyLog;
  selectedDate: string;
  isLoading: boolean;
  
  // Actions
  addHabit: (name: string, emoji: string) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  toggleHabit: (habitId: string, date: string) => Promise<void>;
  fetchHabits: () => Promise<void>;
  getHabits: () => Habit[];
  getCompletionForDate: (date: string) => number;
  setSelectedDate: (date: string) => void;
  syncLocalToRemote: () => Promise<void>;
  clearLocalData: () => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: {},
      selectedDate: format(new Date(), 'yyyy-MM-dd'),
      isLoading: false,

      fetchHabits: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return; // Keep using local data if guest

        set({ isLoading: true });

        // Fetch Habits
        const { data: habitsData } = await supabase
          .from('habits')
          .select('*')
          .order('created_at', { ascending: true });

        // Fetch Logs (last 365 days mostly, but let's fetch all for simplicity for now)
        const { data: logsData } = await supabase
          .from('habit_logs')
          .select('habit_id, date, completed');

        // Transform remote data to local shape
        if (habitsData && logsData) {
          const remoteHabits: Habit[] = habitsData.map(h => ({
            id: h.id,
            name: h.title,
            emoji: h.emoji,
            createdAt: h.created_at
          }));

          const remoteLogs: DailyLog = {};
          logsData.forEach(log => {
            if (log.completed) {
              if (!remoteLogs[log.date]) remoteLogs[log.date] = [];
              remoteLogs[log.date].push(log.habit_id);
            }
          });

          set({ habits: remoteHabits, logs: remoteLogs });
        }
        
        set({ isLoading: false });
      },

      addHabit: async (name, emoji) => {
        const user = useAuthStore.getState().user;
        const newHabit: Habit = {
          id: uuidv4(),
          name,
          emoji,
          createdAt: new Date().toISOString(),
        };

        // Optimistic Update
        set((state) => ({ habits: [...state.habits, newHabit] }));

        if (user) {
          // Sync to DB
          await supabase.from('habits').insert({
            id: newHabit.id,
            user_id: user.id,
            title: name,
            emoji: emoji,
            created_at: newHabit.createdAt
          });
        }
      },

      removeHabit: async (id) => {
        const user = useAuthStore.getState().user;
        
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          logs: Object.fromEntries(
            Object.entries(state.logs).map(([date, completedIds]) => [
              date,
              completedIds.filter((hId) => hId !== id),
            ])
          ),
        }));

        if (user) {
          await supabase.from('habits').delete().eq('id', id);
        }
      },

      toggleHabit: async (habitId, date) => {
        const user = useAuthStore.getState().user;

        // Optimistic Update
        set((state) => {
          const currentLog = state.logs[date] || [];
          const isCompleted = currentLog.includes(habitId);
          
          let newLog;
          if (isCompleted) {
            newLog = currentLog.filter((id) => id !== habitId);
          } else {
            newLog = [...currentLog, habitId];
          }

          return {
            logs: { ...state.logs, [date]: newLog },
          };
        });

        // Sync to DB
        if (user) {
            const state = get();
            const isCompleted = state.logs[date]?.includes(habitId);

            if (isCompleted) {
                // Insert log
                await supabase.from('habit_logs').upsert({
                    habit_id: habitId,
                    user_id: user.id,
                    date: date,
                    completed: true
                }, { onConflict: 'habit_id, date'}); // Schema likely has unique constraint
            } else {
                // Delete log (or set completed=false, but schema says completed default true)
                // Let's delete the row for unchecked
                await supabase.from('habit_logs').delete()
                    .eq('habit_id', habitId)
                    .eq('date', date);
            }
        }
      },

      getHabits: () => get().habits,

      getCompletionForDate: (date) => {
        const state = get();
        const totalHabits = state.habits.length;
        if (totalHabits === 0) return 0;
        
        const completedCount = state.logs[date]?.length || 0;
        return Math.round((completedCount / totalHabits) * 100);
      },

      setSelectedDate: (date) => set({ selectedDate: date }),

      syncLocalToRemote: async () => {
        const user = useAuthStore.getState().user;
        const state = get();
        if (!user) return;

        // Push all local habits that don't exist remotely?
        // For simplicity v1: Just push current state as "new" data if table is empty?
        // Or: Iterate and upsert.
        
        for (const habit of state.habits) {
          await supabase.from('habits').upsert({
            id: habit.id,
            user_id: user.id,
            title: habit.name,
            emoji: habit.emoji,
            created_at: habit.createdAt
          });
        }

        // Logs
        for (const [date, habitIds] of Object.entries(state.logs)) {
             for (const hId of habitIds) {
                 await supabase.from('habit_logs').upsert({
                    habit_id: hId,
                    user_id: user.id,
                    date,
                    completed: true
                 });
             }
        }
        
        // After syncing up, refresh from remote to ensure consistency
        get().fetchHabits();
      },

      clearLocalData: () => set({ habits: [], logs: {} })
    }),
    {
      name: 'cetele-storage',
    }
  )
);
