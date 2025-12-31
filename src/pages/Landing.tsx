import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Trophy, Calendar as CalendarIcon, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

// Mock data for visual demonstration
const MOCK_HEATMAP = Array.from({ length: 28 }, () => {
  return Math.random() > 0.3 ? Math.random() * 0.7 + 0.3 : 0;
});

const LeaderboardRow = ({ rank, name, score }: { rank: number; name: string; score: number }) => (
  <div className="flex items-center justify-between py-3 border-b border-stone-border last:border-0">
    <div className="flex items-center gap-3">
      <span className={`font-mono text-xs ${rank === 1 ? 'text-sienna' : 'text-gray-400'}`}>
        0{rank}
      </span>
      <div className="w-6 h-6 rounded-full bg-stone-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-stone-400 to-stone-200" />
      </div>
      <span className="font-sans text-sm tracking-tight">{name}</span>
    </div>
    <div className="font-mono text-xs font-medium">{score}%</div>
  </div>
);

export const Landing = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signInWithOtp, user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { error: authError } = await signInWithOtp(email);

    if (authError) {
      setError(authError.message);
      setIsSubmitting(false);
    } else {
      setEmailSent(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bone text-charcoal relative overflow-hidden font-sans selection:bg-olive selection:text-white">
      {/* Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Nav */}
      <nav className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-40">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tighter uppercase font-mono">Cetele.</h1>
          <span className="text-[10px] uppercase tracking-widest text-stone-500 mt-1">
            Private Tracker v1.0
          </span>
        </div>
        <button className="text-xs font-mono border-b border-transparent hover:border-charcoal transition-colors uppercase tracking-widest">
          Request Access
        </button>
      </nav>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 min-h-screen pt-24 pb-12 px-6 lg:px-12 gap-12">
        {/* Left Column: Copy & Login */}
        <div className="lg:col-span-5 flex flex-col justify-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl lg:text-7xl font-serif leading-[1.1] mb-6 text-charcoal">
              The art of <br />
              <span className="italic text-olive">consistency.</span>
            </h1>

            <p className="text-lg text-charcoal-soft leading-relaxed max-w-md mb-12 font-light">
              A private ledger for your daily habits. No gamification, no distractions. Just you,
              your progress, and the satisfaction of a day well spent.
            </p>

            {/* Login Module */}
            <div className="w-full max-w-sm">
              <div className="bg-bone-dark border border-stone-border p-1 shadow-paper">
                <div className="bg-bone border border-stone-border p-6 relative overflow-hidden group">
                  {/* Decorative corners */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-stone-400" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-stone-400" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-stone-400" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-stone-400" />

                  <h3 className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
                    <Lock size={12} /> Member Entry
                  </h3>

                  {emailSent ? (
                    <div className="text-center py-6">
                      <Mail className="mx-auto mb-3 text-olive" size={32} />
                      <p className="text-sm font-mono text-charcoal mb-2">Check your email!</p>
                      <p className="text-xs text-stone-500">{email}</p>
                      <p className="text-xs text-stone-400 mt-4">Click the link to sign in</p>
                    </div>
                  ) : (
                    <form className="space-y-4" onSubmit={handleLogin}>
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 text-xs font-mono rounded">
                          {error}
                        </div>
                      )}

                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border-b border-stone-border py-2 text-sm font-mono focus:outline-none focus:border-olive transition-colors placeholder:text-stone-400"
                        required
                        disabled={isSubmitting}
                      />

                      <button
                        type="submit"
                        disabled={isSubmitting || !email.trim()}
                        className="w-full mt-4 bg-charcoal text-bone py-3 text-xs uppercase tracking-widest hover:bg-olive transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Magic Link'} <ArrowRight size={14} />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Visualizations */}
        <div className="lg:col-span-7 flex items-center justify-center relative">
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-bone-dark to-transparent rounded-full opacity-50 blur-3xl -z-10" />

          {/* Dashboard Preview Cards */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
            {/* Heatmap Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="col-span-2 bg-white p-6 shadow-sm border border-stone-border"
            >
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h4 className="font-serif text-xl italic text-charcoal">December</h4>
                  <p className="font-mono text-[10px] text-stone-500 mt-1 uppercase">
                    Consistency Score
                  </p>
                </div>
                <div className="text-3xl font-light text-olive">
                  87<span className="text-sm">%</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                  <div key={d} className="text-[10px] text-center text-stone-400 font-mono mb-1">
                    {d}
                  </div>
                ))}
                {MOCK_HEATMAP.map((opacity, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    className="aspect-square w-full relative group"
                  >
                    <div
                      className={`w-full h-full ${opacity === 0 ? 'bg-bone-dark' : 'bg-olive'}`}
                      style={{ opacity: opacity === 0 ? 1 : opacity }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-[10px] py-1 px-2 whitespace-nowrap z-20">
                      Day {i + 1}: {Math.round(opacity * 100)}%
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Today's Snapshot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="col-span-1 bg-[#F9F8F6] p-5 border border-stone-border flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 text-olive mb-4">
                <CalendarIcon size={16} />
                <span className="text-xs font-mono uppercase tracking-wider">Today</span>
              </div>

              <div className="space-y-3">
                {['Read 30m', 'Hydrate', 'Journal'].map((habit, i) => (
                  <div key={i} className="flex items-center gap-3 group cursor-pointer">
                    <div
                      className={`w-4 h-4 border border-charcoal flex items-center justify-center transition-colors ${
                        i === 0 ? 'bg-charcoal' : 'hover:bg-stone-200'
                      }`}
                    >
                      {i === 0 && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                        >
                          <path d="M2 5L4 7L8 3" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        i === 0 ? 'line-through text-stone-400' : 'text-charcoal'
                      }`}
                    >
                      {habit}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mini Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="col-span-1 bg-[#F9F8F6] p-5 border border-stone-border"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sienna">
                  <Trophy size={16} />
                  <span className="text-xs font-mono uppercase tracking-wider">Leaders</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-black rounded-full" />
                  <div className="w-1 h-1 bg-stone-300 rounded-full" />
                </div>
              </div>

              <div className="flex flex-col">
                <LeaderboardRow rank={1} name="You" score={87} />
                <LeaderboardRow rank={2} name="Alex" score={82} />
                <LeaderboardRow rank={3} name="Sarah" score={79} />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer Quote */}
      <footer className="fixed bottom-6 right-8 lg:right-12 text-right hidden lg:block opacity-40 mix-blend-multiply">
        <p className="font-serif italic text-sm text-charcoal">"We are what we repeatedly do."</p>
      </footer>
    </div>
  );
};
