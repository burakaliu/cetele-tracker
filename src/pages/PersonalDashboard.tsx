import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHabitStore } from '../store/useHabitStore';
import { useAuthStore } from '../store/useAuthStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { HabitIcon } from '../components/HabitIcon';
import { HabitForm } from '../components/HabitForm';

export const PersonalDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { habits, logs, fetchHabits, toggleHabit } = useHabitStore();
  const { profile, signOut } = useAuthStore();

  useEffect(() => {
    const loadHabits = async () => {
      try {
        await fetchHabits();
      } catch (err) {
        setError('Failed to load habits. Please refresh.');
      }
    };
    loadHabits();
  }, []);

  // Generate calendar data for current month
  const generateCalendarData = () => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const completedCount = logs[dateStr]?.length || 0;
      const totalHabits = habits.length;
      const score = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;

      return {
        date: day,
        dateStr,
        score,
        opacity: score > 0 ? 0.3 + (score / 100) * 0.7 : 0,
      };
    });
  };

  const calendarData = generateCalendarData();
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const todayHabits = habits.map((habit) => {
    const isCompleted = logs[selectedDateStr]?.includes(habit.id) || false;
    return {
      ...habit,
      completed: isCompleted,
    };
  });

  const handleToggleHabit = async (habitId: string) => {
    await toggleHabit(habitId, selectedDateStr);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bone text-charcoal relative overflow-hidden">
      {/* Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="border-b border-stone-border bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/dashboard')} className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tighter uppercase font-mono">Cetele.</h1>
              <span className="text-[8px] uppercase tracking-widest text-stone-500">
                Personal Ledger
              </span>
            </button>

            <nav className="flex gap-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm font-mono tracking-wide text-olive border-b-2 border-olive pb-1"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="text-sm font-mono tracking-wide text-charcoal-soft hover:text-charcoal border-b-2 border-transparent hover:border-stone-border pb-1 transition-colors"
              >
                Leaderboard
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-bone-dark rounded-full">
              <User size={14} className="text-charcoal-soft" />
              <span className="text-xs font-mono">{profile?.username || 'Guest'}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-bone-dark rounded-full transition-colors"
            >
              <LogOut size={16} className="text-charcoal-soft" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
          {/* Left: GitHub-style Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-stone-border p-8 shadow-paper"
          >
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-serif text-3xl italic text-charcoal mb-1">
                  {format(new Date(), 'MMMM yyyy')}
                </h2>
                <p className="font-mono text-xs text-stone-500 uppercase tracking-wider">
                  Consistency Ledger
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-light text-olive">
                  {Math.round(
                    calendarData.reduce((sum, day) => sum + day.score, 0) / calendarData.length
                  )}
                  <span className="text-lg">%</span>
                </div>
                <p className="text-xs text-charcoal-soft font-mono">Avg Score</p>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
              {/* Day labels */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-[10px] text-center text-stone-500 font-mono">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: calendarData[0]?.date.getDay() || 0 }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {calendarData.map((day) => {
                  const isSelected = isSameDay(day.date, selectedDate);
                  const isToday = isSameDay(day.date, new Date());

                  return (
                    <motion.button
                      key={day.dateStr}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedDate(day.date)}
                      className={`aspect-square relative group ${
                        isSelected ? 'ring-2 ring-olive ring-offset-2' : ''
                      }`}
                    >
                      <div
                        className={`w-full h-full flex items-center justify-center text-xs font-mono ${
                          day.score === 0 ? 'bg-bone-dark text-stone-400' : 'bg-olive text-white'
                        } ${isToday ? 'ring-2 ring-sienna' : ''}`}
                        style={{ opacity: day.opacity === 0 ? 1 : day.opacity }}
                      >
                        {format(day.date, 'd')}
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-[10px] py-1 px-2 whitespace-nowrap z-20 rounded">
                        {format(day.date, 'MMM d')}: {Math.round(day.score)}%
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 flex items-center gap-4 text-xs text-charcoal-soft font-mono">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 0.3, 0.5, 0.7, 1].map((opacity, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 bg-olive"
                    style={{ opacity: opacity === 0 ? 0.2 : opacity }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </motion.div>

          {/* Right: Selected Day's Habits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-stone-border p-8 shadow-paper"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-serif text-3xl italic text-charcoal mb-1">
                  {format(selectedDate, 'EEEE')}
                </h2>
                <p className="font-mono text-xs text-stone-500 uppercase tracking-wider">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </p>
              </div>
              <button
                onClick={() => setIsHabitFormOpen(true)}
                className="p-2 bg-olive hover:bg-olive-hover text-white rounded-full transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 font-mono text-sm">
                {error}
              </div>
            )}

            {/* Habits List */}
            <div className="space-y-1">
              {todayHabits.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar size={64} className="mx-auto text-stone-300 mb-6" />
                  <h3 className="font-serif text-2xl italic text-charcoal mb-2">
                    Your ledger awaits
                  </h3>
                  <p className="text-charcoal-soft font-sans text-sm mb-6 max-w-xs mx-auto">
                    Start by creating your first habit. Small steps, lasting change.
                  </p>
                  <button
                    onClick={() => setIsHabitFormOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-olive text-white font-mono text-xs uppercase tracking-wider hover:bg-olive-hover transition-colors"
                  >
                    <Plus size={16} />
                    Create First Habit
                  </button>
                </div>
              ) : (
                todayHabits.map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-stone-border last:border-0 py-4 hover:bg-bone/50 transition-colors px-4 -mx-4"
                  >
                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      className="flex items-center gap-4 w-full text-left"
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-6 h-6 border-2 flex items-center justify-center transition-all ${
                          habit.completed
                            ? 'bg-olive border-olive'
                            : 'border-stone-border hover:border-olive'
                        }`}
                      >
                        {habit.completed && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                          >
                            <path d="M3 7L6 10L11 4" />
                          </svg>
                        )}
                      </div>

                      {/* Habit Info */}
                      <div className="flex-1 flex items-center gap-2">
                        <HabitIcon iconName={habit.emoji} size={18} className="text-charcoal flex-shrink-0" />
                        <h3
                          className={`text-base font-medium ${
                            habit.completed ? 'line-through text-stone-400' : 'text-charcoal'
                          }`}
                        >
                          {habit.name}
                        </h3>
                      </div>
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Daily Score */}
            {todayHabits.length > 0 && (
              <div className="mt-8 pt-6 border-t border-stone-border">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm text-charcoal-soft uppercase tracking-wider">
                    Today's Score
                  </span>
                  <span className="text-3xl font-light text-olive">
                    {Math.round(
                      (todayHabits.filter((h) => h.completed).length / todayHabits.length) * 100
                    )}
                    <span className="text-lg">%</span>
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Habit Creation Modal */}
      {isHabitFormOpen && (
        <HabitForm onClose={() => setIsHabitFormOpen(false)} />
      )}
    </div>
  );
};
