import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Trophy, BookOpen, User, Settings, HeartPulse } from 'lucide-react';

interface PlayPageProps {
  onNavigate?: (page: string) => void;
}

// Define case type
interface Case {
  case_id: string;
  difficulty: string;
  patient: {
    name: string;
    age: number;
    gender: string;
  };
  chief_complaint: string;
  medical_history: string[];
  vitals: {
    hr: number;
    sbp: number;
    dbp: number;
    spo2: number;
    temp_c: number;
    rr: number;
  };
}

// Define user session type
interface UserStats {
  cases: number;
  successRate: number;
  hours: number;
  recentActivity: string;
  bestScore: number;
}

export function PlayPage({ onNavigate }: PlayPageProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user stats and data from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch cases from backend to get count
        const casesResponse = await fetch('http://localhost:5000/api/cases');
        const casesData = await casesResponse.json();
        
        // In a real app, you might fetch user-specific stats
        // For now, we'll calculate stats based on available data
        const totalCases = casesData.length;
        
        // You could also fetch user-specific data here:
        // const userStatsResponse = await fetch('http://localhost:5000/api/user/stats');
        // const userData = await userStatsResponse.json();
        
        setStats({
          cases: totalCases,
          successRate: 85, // This could be fetched from user's session data
          hours: 32,       // This could be calculated from user's session history
          recentActivity: 'Completed MI simulation',
          bestScore: 12450
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics. Please try again later.');
        setStats({
          cases: 0,
          successRate: 0,
          hours: 0,
          recentActivity: 'No activity',
          bestScore: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Function to start a new simulation
  const startSimulation = async () => {
    try {
      // Get all cases from backend
      const casesResponse = await fetch('http://localhost:5000/api/cases');
      const cases = await casesResponse.json();

      if (cases.length > 0) {
        if (onNavigate) {
          onNavigate('case-selection');
        }
      } else {
        // If no cases available, navigate to case selection anyway
        if (onNavigate) {
          onNavigate('case-selection');
        }
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
      // Fallback to case selection page
      if (onNavigate) {
        onNavigate('case-selection');
      }
    }
  };

  // Function to view leaderboard
  const viewLeaderboard = async () => {
    try {
      // Fetch leaderboard data to verify connection
      const leaderboardResponse = await fetch('http://localhost:5000/api/leaderboard');
      if (leaderboardResponse.ok) {
        if (onNavigate) {
          onNavigate('leaderboard');
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      if (onNavigate) {
        onNavigate('leaderboard');
      }
    }
  };

  // Function to view case library
  const viewCaseLibrary = async () => {
    try {
      // Fetch cases to verify connection
      const casesResponse = await fetch('http://localhost:5000/api/cases');
      if (casesResponse.ok) {
        if (onNavigate) {
          onNavigate('case-library');
        }
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      if (onNavigate) {
        onNavigate('case-library');
      }
    }
  };

  const options = [
    {
      id: 'start-simulation',
      title: 'Start Simulation',
      description: 'Begin your medical simulation experience',
      icon: Play,
      color: '#00A896',
      action: startSimulation
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      description: 'View top performers and rankings',
      icon: Trophy,
      color: '#FFD166',
      action: viewLeaderboard
    },
    {
      id: 'case-library',
      title: 'Case Library',
      description: 'Browse available medical cases',
      icon: BookOpen,
      color: '#EF476F',
      action: viewCaseLibrary
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0D1B2A] text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#00A896] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-xl">Loading medical simulation hub...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#0D1B2A] text-white flex items-center justify-center">
        <div className="text-center p-8 bg-[#1B263B] rounded-2xl border border-[#EF476F]/50 max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-[#EF476F]">Connection Error</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-gray-400 mb-6">Make sure the backend server is running on port 5000</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#00A896] rounded-xl hover:bg-[#00A896]/80 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-[#0D1B2A] text-white overflow-hidden"
      style={{
        fontFamily: 'Poppins, sans-serif',
        backgroundImage: `radial-gradient(circle at 10% 20%, rgba(0, 168, 150, 0.05) 0%, transparent 20%),
                          radial-gradient(circle at 90% 80%, rgba(0, 128, 144, 0.05) 0%, transparent 20%)`
      }}
    >
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#00A896]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00A896] to-[#028090] flex items-center justify-center">
            <Play size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold font-['Inter']" style={{ fontFamily: 'Inter, sans-serif' }}>
            MediSim AI
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A896] to-[#028090] flex items-center justify-center"
          >
            <User size={20} className="text-white" />
          </button>
          <button className="p-2 rounded-lg bg-[#00A896]/20 hover:bg-[#00A896]/30 transition-colors">
            <Settings size={20} className="text-[#00A896]" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Center Content - Options Grid */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="max-w-4xl w-full text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-6 font-['Inter']"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Medical Simulation Hub
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[#00A896] text-xl mb-16 max-w-2xl mx-auto"
            >
              Enhance your clinical skills with realistic medical simulations and case studies
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
            {options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={option.action}
                className="bg-[#1B263B]/50 border border-[#00A896]/30 rounded-3xl p-8 cursor-pointer group hover:bg-[#1B263B]/70 transition-all"
              >
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br mb-6 flex items-center justify-center mx-auto"
                  style={{
                    background: `linear-gradient(135deg, ${option.color}40, ${option.color}20)`
                  }}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: `${option.color}50`
                  }}
                >
                  <option.icon size={32} style={{ color: option.color }} />
                </motion.div>

                <h3
                  className="text-2xl font-bold mb-3 font-['Inter'] group-hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {option.title}
                </h3>

                <p className="text-gray-300 mb-6">
                  {option.description}
                </p>

                <motion.div
                  className="flex items-center justify-center gap-2 text-[#00A896] font-medium"
                  whileHover={{ x: 5 }}
                >
                  <span>Select</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    →
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Panel - Real-time Patient Monitor */}
        <div className="w-2/5 hidden lg:flex flex-col items-center justify-center p-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-sm bg-[#1B263B] rounded-3xl p-6 border border-[#00A896]/30 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold font-['Inter'] text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>Live Patient Monitor</h3>
              <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
            </div>

            {/* Heart Rate Monitor */}
            <div className="relative mb-6">
              <div className="w-full h-40 rounded-2xl bg-[#0F1C2E] border border-[#00A896]/20 flex items-center justify-center relative overflow-hidden">
                {/* Animated ECG Line */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 400 100"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M 0 50 L 50 50 L 70 20 L 90 80 L 110 50 L 130 50 L 150 20 L 170 80 L 190 50 L 210 50 L 230 20 L 250 80 L 270 50 L 290 50 L 310 20 L 330 80 L 350 50 L 370 50 L 400 50"
                    fill="none"
                    stroke="url(#ecgGradient)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: 'loop',
                      ease: 'linear'
                    }}
                  />
                  <defs>
                    <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00A896" />
                      <stop offset="50%" stopColor="#028090" />
                      <stop offset="100%" stopColor="#00A896" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Heart Icon */}
                <motion.div
                  className="relative z-10"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: 'loop'
                  }}
                >
                  <HeartPulse size={40} className="text-[#00A896]" />
                </motion.div>
              </div>
            </div>

            {/* Vital Stats */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-[#0F1C2E] rounded-xl">
                <span className="text-gray-300">Heart Rate</span>
                <span className="text-white font-bold">82 bpm</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0F1C2E] rounded-xl">
                <span className="text-gray-300">Blood Pressure</span>
                <span className="text-white font-bold">120/80 mmHg</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0F1C2E] rounded-xl">
                <span className="text-gray-300">O₂ Saturation</span>
                <span className="text-white font-bold">98%</span>
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            className="mt-8 w-full max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#1B263B] border border-[#00A896]/30 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-[#00A896]">
                  {stats?.cases || 0}
                </div>
                <div className="text-xs text-gray-400">Cases</div>
              </div>
              <div className="bg-[#1B263B] border border-[#00A896]/30 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-[#FFD166]">
                  {stats?.successRate || 0}%
                </div>
                <div className="text-xs text-gray-400">Success</div>
              </div>
              <div className="bg-[#1B263B] border border-[#00A896]/30 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-[#EF476F]">
                  {stats?.hours || 0}
                </div>
                <div className="text-xs text-gray-400">Hours</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Profile Menu Dropdown */}
      <AnimatePresence>
        {profileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-20 right-6 w-64 bg-[#1B263B] border border-[#00A896]/30 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-[#00A896]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A896] to-[#028090] flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-medium">Dr. Alex Johnson</p>
                  <p className="text-xs text-[#00A896]">Cardiology Resident</p>
                </div>
              </div>
            </div>
            <div className="py-2">
              <button className="w-full text-left px-4 py-2 hover:bg-[#00A896]/10 flex items-center gap-2">
                <User size={16} className="text-[#00A896]" />
                <span>My Profile</span>
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-[#00A896]/10 flex items-center gap-2">
                <Trophy size={16} className="text-[#00A896]" />
                <span>My Achievements</span>
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-[#00A896]/10 flex items-center gap-2">
                <Settings size={16} className="text-[#00A896]" />
                <span>Settings</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}