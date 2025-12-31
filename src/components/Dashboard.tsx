/**
 * DEPRECATED: This component is not used in the current routing setup.
 * See /src/pages/PersonalDashboard.tsx for the active dashboard implementation.
 * Can be removed in future cleanup.
 */

import React, { useState, useEffect } from 'react';
import { HabitHeatmap } from './HabitHeatmap';
import { DateNavigation } from './DateNavigation';
import { DailyView } from './DailyView';
import { HabitForm } from './HabitForm';
import { AuthModal } from './AuthModal';
import { Leaderboard } from './Leaderboard';
import { useAuthStore } from '../store/useAuthStore';
import { useHabitStore } from '../store/useHabitStore';
import { Plus, User as UserIcon } from 'lucide-react';
import classes from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  const { initialize, user, profile } = useAuthStore();
  const { fetchHabits } = useHabitStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [user]); // Re-fetch when user changes (login/logout)

  return (
    <div className={classes.dashboard}>
      <aside className={classes.sidebar}>
        <div className={classes.brand}>
          <h1>Cetele</h1>
          <span className={classes.badge}>PRO</span>
        </div>
        
        <HabitHeatmap />
        
        <div className={classes.leaderboardWrapper}>
            <Leaderboard />
        </div>
      </aside>

      <main className={classes.main}>
        <header className={classes.header}>
            <DateNavigation />
            
            <button className={classes.authButton} onClick={() => setIsAuthOpen(true)}>
                {user ? (
                    <div className={classes.avatar}>
                        {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                ) : (
                    <>
                        <UserIcon size={18} />
                        <span>Sign In</span>
                    </>
                )}
            </button>
        </header>
        
        <div className={classes.content}>
          <DailyView />
        </div>

        <button className={classes.fab} onClick={() => setIsFormOpen(true)}>
          <Plus size={24} />
        </button>
      </main>

      {isFormOpen && <HabitForm onClose={() => setIsFormOpen(false)} />}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </div>
  );
};
