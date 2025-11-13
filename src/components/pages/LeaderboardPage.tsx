import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Target, Clock, Users, Award, Star } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface LeaderboardEntry {
  playerId: string;
  playerInitials: string;
  score: number;
  time: number;
  rank: number;
  caseId?: string;
  difficulty?: string;
  timestamp?: string;
  patientOutcome?: string;
}

interface LeaderboardPageProps {
  onNavigate: (page: string) => void;
}

export function LeaderboardPage({ onNavigate }: LeaderboardPageProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data from backend
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/leaderboard?timeRange=${timeFilter}&limit=10`);
        if (!response.ok) {
          throw new Error(`Failed to fetch leaderboard: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setLeaderboardData(data);
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeFilter]);

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="text-yellow-500" size={20} />;
    if (position === 2) return <Award className="text-gray-400" size={20} />;
    if (position === 3) return <Star className="text-amber-600" size={20} />;
    return <span className="text-muted-foreground font-bold">{position}</span>;
  };

  // Convert seconds to time string (MM:SS or HH:MM:SS)
  const secondsToTimeString = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#00A896] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center p-8 bg-card rounded-2xl border border-destructive/50">
          <h2 className="text-2xl font-bold mb-4 text-destructive">Error Loading Leaderboard</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Please make sure the backend server is running on http://localhost:5001</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#00A896] rounded-xl hover:bg-[#00A896]/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background to-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logo and Navigation */}
        <div className="flex items-center justify-between mb-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00A896] to-[#028090] flex items-center justify-center shadow-lg"
            >
              <span className="text-white text-xl">M</span>
            </motion.div>
            <div>
              <h2 className="text-[#00A896]">Meducate</h2>
              <p className="text-xs text-muted-foreground">Leaderboard</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <motion.button
              onClick={() => onNavigate('play')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/70 rounded-xl transition-all text-sm"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Play</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Medical Leaderboard</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how you rank against other medical professionals in various specialties
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          <div className="flex gap-2">
            <button
              onClick={() => setTimeFilter('day')}
              className={`px-4 py-2 rounded-xl transition-all ${
                timeFilter === 'day'
                  ? 'bg-[#00A896] text-white'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-4 py-2 rounded-xl transition-all ${
                timeFilter === 'week'
                  ? 'bg-[#00A896] text-white'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-4 py-2 rounded-xl transition-all ${
                timeFilter === 'month'
                  ? 'bg-[#00A896] text-white'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-4 py-2 rounded-xl transition-all ${
                timeFilter === 'all'
                  ? 'bg-[#00A896] text-white'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              All Time
            </button>
          </div>

          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-xl"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="critical">Critical</option>
            <option value="severe">Severe</option>
          </select>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="text-[#00A896]" size={24} />
              Top Performers
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {timeFilter === 'day' ? 'Today' : timeFilter === 'week' ? 'This Week' : timeFilter === 'month' ? 'This Month' : 'All Time'} • {leaderboardData.length} physicians
            </p>
          </div>

          <div className="divide-y divide-border">
            {leaderboardData.length > 0 ? (
              leaderboardData.map((entry, index) => (
                <motion.div
                  key={entry.playerId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors ${
                    entry.rank <= 3 ? 'bg-gradient-to-r from-amber-50/30 to-amber-100/20' : ''
                  }`}
                >
                  <div className="w-10 flex justify-center">
                    {getMedalIcon(entry.rank)}
                  </div>

                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00A896] to-[#028090] flex items-center justify-center text-white font-bold">
                    {entry.playerInitials.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium">{entry.playerInitials}</h3>
                    <p className="text-xs text-muted-foreground">Rank #{entry.rank}</p>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-[#00A896]" />
                      <span className="font-bold text-lg">{entry.score.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {secondsToTimeString(entry.time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target size={12} />
                        {entry.caseId || 'Case'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No leaderboard entries available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A896]/20 to-[#028090]/20 flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-[#00A896]" />
            </div>
            <h3 className="text-2xl font-bold">
              {leaderboardData.length}
            </h3>
            <p className="text-sm text-muted-foreground">Active Players</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A896]/20 to-[#028090]/20 flex items-center justify-center mx-auto mb-4">
              <Target size={24} className="text-[#00A896]" />
            </div>
            <h3 className="text-2xl font-bold">
              {leaderboardData.length > 0 
                ? Math.round(leaderboardData.reduce((sum, entry) => sum + entry.score, 0) / leaderboardData.length) 
                : 0}
            </h3>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A896]/20 to-[#028090]/20 flex items-center justify-center mx-auto mb-4">
              <Trophy size={24} className="text-[#00A896]" />
            </div>
            <h3 className="text-2xl font-bold">{leaderboardData.length > 0 ? Math.max(...leaderboardData.map(e => e.score)) : 0}</h3>
            <p className="text-sm text-muted-foreground">Top Score</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}