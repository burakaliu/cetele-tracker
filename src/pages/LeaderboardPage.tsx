import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, User, LogOut, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

type TimeRange = 'daily' | 'weekly' | 'monthly';

interface LeaderboardEntry {
  username: string;
  avatar_url: string;
  score: number;
  rank: number;
}

export const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState<TimeRange>('daily');
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    let data: any[] | null = [];

    if (activeTab === 'daily') {
      const today = format(new Date(), 'yyyy-MM-dd');
      const result = await supabase
        .from('daily_summaries')
        .select('username, avatar_url, score')
        .eq('date', today)
        .order('score', { ascending: false })
        .limit(10);
      data = result.data;
    } else if (activeTab === 'weekly') {
      const result = await supabase
        .from('daily_summaries')
        .select('*')
        .gte('date', format(startOfWeek(new Date()), 'yyyy-MM-dd'))
        .lte('date', format(endOfWeek(new Date()), 'yyyy-MM-dd'));

      if (result.data) {
        const agg: Record<string, { username: string; scoreSum: number; count: number }> = {};
        result.data.forEach((row: any) => {
          const key = row.username || 'Anonymous';
          if (!agg[key]) agg[key] = { username: key, scoreSum: 0, count: 0 };
          agg[key].scoreSum += row.score;
          agg[key].count += 1;
        });
        data = Object.values(agg)
          .map((item) => ({
            username: item.username,
            avatar_url: '',
            score: Math.round(item.scoreSum / item.count),
          }))
          .sort((a, b) => b.score - a.score);
      }
    } else {
      // Monthly
      const result = await supabase
        .from('daily_summaries')
        .select('*')
        .gte('date', format(startOfMonth(new Date()), 'yyyy-MM-dd'))
        .lte('date', format(endOfMonth(new Date()), 'yyyy-MM-dd'));

      if (result.data) {
        const agg: Record<string, { username: string; scoreSum: number; count: number }> = {};
        result.data.forEach((row: any) => {
          const key = row.username || 'Anonymous';
          if (!agg[key]) agg[key] = { username: key, scoreSum: 0, count: 0 };
          agg[key].scoreSum += row.score;
          agg[key].count += 1;
        });
        data = Object.values(agg)
          .map((item) => ({
            username: item.username,
            avatar_url: '',
            score: Math.round(item.scoreSum / item.count),
          }))
          .sort((a, b) => b.score - a.score);
      }
    }

    if (data) {
      setLeaders(
        data.map((item, index) => ({
          ...item,
          username: item.username || 'Anonymous',
          rank: index + 1,
        }))
      );
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={20} className="text-sienna" />;
      case 2:
        return <Medal size={20} className="text-stone-500" />;
      case 3:
        return <Award size={20} className="text-stone-400" />;
      default:
        return null;
    }
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
                Competition Hall
              </span>
            </button>

            <nav className="flex gap-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm font-mono tracking-wide text-charcoal-soft hover:text-charcoal border-b-2 border-transparent hover:border-stone-border pb-1 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="text-sm font-mono tracking-wide text-olive border-b-2 border-olive pb-1"
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
      <main className="max-w-4xl mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="font-serif text-5xl italic text-charcoal mb-3">
            The <span className="text-olive">Honor Roll</span>
          </h1>
          <p className="text-charcoal-soft font-mono text-sm">
            Those who show up, every day, without fail
          </p>
        </motion.div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white border border-stone-border shadow-paper">
            {[
              { key: 'daily', label: 'Daily' },
              { key: 'weekly', label: 'Weekly' },
              { key: 'monthly', label: 'Monthly' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TimeRange)}
                className={`px-8 py-3 font-mono text-sm uppercase tracking-widest transition-all ${
                  activeTab === tab.key
                    ? 'bg-olive text-white'
                    : 'bg-white text-charcoal-soft hover:bg-bone-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-stone-border shadow-paper-lg"
        >
          <div className="border-b border-stone-border p-6 bg-bone-dark">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp size={24} className="text-olive" />
                <div>
                  <h2 className="font-serif text-2xl italic text-charcoal">
                    {activeTab === 'daily' && "Today's Leaders"}
                    {activeTab === 'weekly' && "This Week's Champions"}
                    {activeTab === 'monthly' && "Monthly Masters"}
                  </h2>
                  <p className="text-xs text-charcoal-soft font-mono mt-1">
                    {activeTab === 'daily' && format(new Date(), 'EEEE, MMMM d')}
                    {activeTab === 'weekly' &&
                      `${format(startOfWeek(new Date()), 'MMM d')} - ${format(
                        endOfWeek(new Date()),
                        'MMM d'
                      )}`}
                    {activeTab === 'monthly' && format(new Date(), 'MMMM yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <div className="inline-block w-8 h-8 border-2 border-olive border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-charcoal-soft font-mono text-sm">Loading rankings...</p>
                </motion.div>
              ) : leaders.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Trophy size={48} className="mx-auto text-stone-300 mb-4" />
                  <p className="text-charcoal-soft font-mono text-sm">No rankings yet</p>
                  <p className="text-xs text-stone-400 mt-2">Start tracking to see leaders</p>
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-2"
                >
                  {leaders.map((leader, index) => (
                    <motion.div
                      key={`${leader.username}-${leader.rank}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded border transition-all ${
                        leader.rank <= 3
                          ? 'bg-bone border-olive/20'
                          : 'bg-white border-stone-border hover:bg-bone/50'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Rank */}
                        <div className="w-12 flex items-center justify-center">
                          {leader.rank <= 3 ? (
                            getRankIcon(leader.rank)
                          ) : (
                            <span className="font-mono text-sm text-charcoal-soft">
                              #{leader.rank}
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-stone-400 to-stone-200 flex items-center justify-center text-white font-bold">
                          {leader.username[0].toUpperCase()}
                        </div>

                        {/* Name */}
                        <div className="flex-1">
                          <h3
                            className={`font-medium ${
                              leader.rank === 1 ? 'text-lg' : 'text-base'
                            } ${leader.rank <= 3 ? 'text-olive' : 'text-charcoal'}`}
                          >
                            {leader.username}
                          </h3>
                          {leader.rank === 1 && (
                            <p className="text-xs text-charcoal-soft font-mono mt-1">
                              Current Champion
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div
                          className={`font-light ${
                            leader.rank === 1 ? 'text-4xl' : leader.rank <= 3 ? 'text-3xl' : 'text-2xl'
                          } ${leader.rank <= 3 ? 'text-olive' : 'text-charcoal'}`}
                        >
                          {leader.score}
                          <span className="text-sm">%</span>
                        </div>
                        {leader.rank <= 3 && (
                          <p className="text-xs text-charcoal-soft font-mono mt-1">score</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 opacity-60"
        >
          <p className="font-serif italic text-sm text-charcoal">
            "Excellence is not a singular act, but a habit."
          </p>
        </motion.div>
      </main>
    </div>
  );
};
