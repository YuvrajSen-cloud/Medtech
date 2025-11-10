import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Target, Clock, Users, Award, Star } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  specialty: string;
  avatar: string;
  position: number;
  completionTime: string;
  accuracy: number;
}

interface LeaderboardPageProps {
  onNavigate: (page: string) => void;
}

export function LeaderboardPage({ onNavigate }: LeaderboardPageProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');

  // Mock data for the leaderboard
  useEffect(() => {
    const mockData: LeaderboardEntry[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        score: 12450,
        specialty: 'Anatomy',
        avatar: '',
        position: 1,
        completionTime: '2h 15m',
        accuracy: 98
      },
      {
        id: '2',
        name: 'Dr. Michael Chen',
        score: 11850,
        specialty: 'Pathology',
        avatar: '',
        position: 2,
        completionTime: '2h 45m',
        accuracy: 95
      },
      {
        id: '3',
        name: 'Dr. Emily Rodriguez',
        score: 11200,
        specialty: 'Pharmacology',
        avatar: '',
        position: 3,
        completionTime: '3h 10m',
        accuracy: 92
      },
      {
        id: '4',
        name: 'Dr. James Wilson',
        score: 10800,
        specialty: 'Cardiology',
        avatar: '',
        position: 4,
        completionTime: '2h 50m',
        accuracy: 94
      },
      {
        id: '5',
        name: 'Dr. Lisa Thompson',
        score: 10500,
        specialty: 'Neurology',
        avatar: '',
        position: 5,
        completionTime: '3h 20m',
        accuracy: 90
      },
      {
        id: '6',
        name: 'Dr. Robert Kim',
        score: 9800,
        specialty: 'Emergency',
        avatar: '',
        position: 6,
        completionTime: '2h 35m',
        accuracy: 88
      },
      {
        id: '7',
        name: 'Dr. Amanda Foster',
        score: 9200,
        specialty: 'Surgery',
        avatar: '',
        position: 7,
        completionTime: '3h 45m',
        accuracy: 91
      },
      {
        id: '8',
        name: 'Dr. David Park',
        score: 8900,
        specialty: 'Pediatrics',
        avatar: '',
        position: 8,
        completionTime: '2h 55m',
        accuracy: 87
      },
      {
        id: '9',
        name: 'Dr. Jennifer Lee',
        score: 8500,
        specialty: 'Orthopedics',
        avatar: '',
        position: 9,
        completionTime: '3h 15m',
        accuracy: 85
      },
      {
        id: '10',
        name: 'Dr. Christopher Brown',
        score: 8200,
        specialty: 'Dermatology',
        avatar: '',
        position: 10,
        completionTime: '2h 40m',
        accuracy: 83
      }
    ];

    setLeaderboardData(mockData);
  }, []);

  const filteredData = timeFilter === 'all' 
    ? leaderboardData 
    : leaderboardData.filter(entry => 
        (timeFilter === 'week' && entry.position <= 5) || 
        (timeFilter === 'month' && entry.position <= 10)
      );

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="text-yellow-500" size={20} />;
    if (position === 2) return <Award className="text-gray-400" size={20} />;
    if (position === 3) return <Star className="text-amber-600" size={20} />;
    return <span className="text-muted-foreground font-bold">{position}</span>;
  };

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
            <option value="all">All Specialties</option>
            <option value="anatomy">Anatomy</option>
            <option value="pathology">Pathology</option>
            <option value="pharmacology">Pharmacology</option>
            <option value="cardiology">Cardiology</option>
            <option value="neurology">Neurology</option>
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
              {timeFilter === 'week' ? 'This Week' : timeFilter === 'month' ? 'This Month' : 'All Time'} • {filteredData.length} physicians
            </p>
          </div>
          
          <div className="divide-y divide-border">
            {filteredData.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors ${
                  entry.position <= 3 ? 'bg-gradient-to-r from-amber-50/30 to-amber-100/20' : ''
                }`}
              >
                <div className="w-10 flex justify-center">
                  {getMedalIcon(entry.position)}
                </div>
                
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00A896] to-[#028090] flex items-center justify-center text-white font-bold">
                  {entry.name.charAt(0)}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium">{entry.name}</h3>
                  <p className="text-xs text-muted-foreground">{entry.specialty}</p>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-[#00A896]" />
                    <span className="font-bold text-lg">{entry.score.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {entry.completionTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target size={12} />
                      {entry.accuracy}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
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
            <h3 className="text-2xl font-bold">2,847</h3>
            <p className="text-sm text-muted-foreground">Active Physicians</p>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A896]/20 to-[#028090]/20 flex items-center justify-center mx-auto mb-4">
              <Target size={24} className="text-[#00A896]" />
            </div>
            <h3 className="text-2xl font-bold">94.7%</h3>
            <p className="text-sm text-muted-foreground">Average Accuracy</p>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A896]/20 to-[#028090]/20 flex items-center justify-center mx-auto mb-4">
              <Trophy size={24} className="text-[#00A896]" />
            </div>
            <h3 className="text-2xl font-bold">15</h3>
            <p className="text-sm text-muted-foreground">Specialties</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}