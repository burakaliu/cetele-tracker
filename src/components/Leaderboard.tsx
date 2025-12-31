import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from './ui/Card';
import classes from './Leaderboard.module.css';
import { cn } from '../lib/utils';
import { format, startOfWeek, endOfWeek } from 'date-fns';

type TimeRange = 'Today' | 'Weekly' | 'All Time';

interface LeaderboardEntry {
  username: string;
  avatar_url: string;
  score: number;
  rank: number;
}

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TimeRange>('Today');
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    let data : any[] | null = [];
    
    // Note: This relies on the `daily_summaries` view being created in Supabase
    if (activeTab === 'Today') {
      const today = format(new Date(), 'yyyy-MM-dd');
      const result = await supabase
        .from('daily_summaries')
        .select('username, avatar_url, score')
        .eq('date', today)
        .order('score', { ascending: false })
        .limit(10);
      data = result.data;
    } 
    else if (activeTab === 'Weekly') {
       // Mocking weekly aggregation for now OR user needs to create a weekly view
       // For simplicity, let's just fetch today's for V1 or try to aggregate if table allows
       // Assuming specific weekly view doesn't exist yet, we'll just show 'Coming Soon' or 
       // query raw logs if we had time. Let's just stick to Today for V1 or client-side filter
       const result = await supabase
        .from('daily_summaries') // This view is by date.
        .select('*')
        .gte('date', format(startOfWeek(new Date()), 'yyyy-MM-dd'))
        .lte('date', format(endOfWeek(new Date()), 'yyyy-MM-dd'));
       
       // Client side aggregation for V1
       if (result.data) {
          const agg : Record<string, {username: string, scoreSum: number, count: number}> = {};
          result.data.forEach((row: any) => {
              const key = row.username || 'Anonymous';
              if (!agg[key]) agg[key] = { username: key, scoreSum: 0, count: 0 };
              agg[key].scoreSum += row.score;
              agg[key].count += 1;
          });
          data = Object.values(agg).map(item => ({
              username: item.username,
              avatar_url: '',
              score: Math.round(item.scoreSum / item.count)
          })).sort((a,b) => b.score - a.score);
       }
    }
    else {
      // All Time
      // Similar client side aggregation for now
      const result = await supabase.from('daily_summaries').select('*').limit(100);
      if (result.data) {
          const agg : Record<string, {username: string, scoreSum: number, count: number}> = {};
          result.data.forEach((row: any) => {
              const key = row.username || 'Anonymous';
              if (!agg[key]) agg[key] = { username: key, scoreSum: 0, count: 0 };
              agg[key].scoreSum += row.score;
              agg[key].count += 1;
          });
          data = Object.values(agg).map(item => ({
              username: item.username,
              avatar_url: '',
              score: Math.round(item.scoreSum / item.count)
          })).sort((a,b) => b.score - a.score);
      }
    }

    if (data) {
       setLeaders(data.map((item, index) => ({
           ...item,
           username: item.username || 'Anonymous',
           rank: index + 1
       })));
    }
    setLoading(false);
  };

  return (
    <Card className={classes.container}>
      <h3 className={classes.title}>Leaderboard</h3>
      
      <div className={classes.tabs}>
        {(['Today', 'Weekly', 'All Time'] as TimeRange[]).map((tab) => (
          <button
            key={tab}
            className={cn(classes.tab, activeTab === tab && classes.activeTab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={classes.list}>
        {loading ? (
            <div className={classes.loading}>Loading...</div>
        ) : leaders.length === 0 ? (
            <div className={classes.empty}>No stats yet</div>
        ) : (
            leaders.map((leader) => (
                <div key={`${leader.username}-${leader.rank}`} className={classes.row}>
                    <div className={classes.rank}>#{leader.rank}</div>
                    <div className={classes.user}>
                        <div className={classes.avatarFallback}>{leader.username[0].toUpperCase()}</div>
                        <span className={classes.username}>{leader.username}</span>
                    </div>
                    <div className={classes.score}>{leader.score}%</div>
                </div>
            ))
        )}
      </div>
    </Card>
  );
};
