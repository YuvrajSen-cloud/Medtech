import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Users, Trophy, Play, ChevronDown, Dna } from 'lucide-react';

interface CaseSelectionPageProps {
  onNavigate?: (page: string) => void;
}

export function CaseSelectionPage({ onNavigate }: CaseSelectionPageProps) {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Critical');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const modes = [
    {
      id: 'solo',
      title: '🩺 Solo Mode',
      description: 'Practice real cases alone.',
      icon: Activity,
      color: '#00A896'
    },
    {
      id: 'multiplayer',
      title: '👥 Multiplayer Mode',
      description: 'Collaborate or compete.',
      icon: Users,
      color: '#FFD166'
    },
    {
      id: 'contest',
      title: '🏆 Contest Mode',
      description: 'Timed leaderboard challenge.',
      icon: Trophy,
      color: '#EF476F'
    }
  ];

  const difficulties = ['Easy', 'Critical', 'Severe'];

  const handleStartCase = () => {
    if (selectedMode && onNavigate) {
      // Navigate to StartSimulation page 
      onNavigate('start-simulation');
    }
  };

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
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B263B] border border-[#00A896]/30 rounded-xl hover:bg-[#1B263B]/80 transition-colors"
            >
              <span>{selectedDifficulty}</span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-40 bg-[#1B263B] border border-[#00A896]/30 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  {difficulties.map((difficulty) => (
                    <motion.button
                      key={difficulty}
                      onClick={() => {
                        setSelectedDifficulty(difficulty);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-[#00A896]/20 transition-colors ${
                        selectedDifficulty === difficulty ? 'bg-[#00A896]/20' : ''
                      }`}
                      whileHover={{ x: 5 }}
                    >
                      {difficulty}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Center Content - Mode Selection Cards */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
          <div className="max-w-4xl w-full text-center">
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-12 font-['Inter']"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Select Simulation Mode
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {modes.map((mode, index) => (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedMode === mode.id
                      ? 'border-[#00A896] bg-[#00A896]/10 shadow-lg shadow-[#00A896]/30'
                      : 'border-[#00A896]/30 bg-[#1B263B]/50 hover:border-[#00A896]/50'
                  }`}
                >
                  <motion.div
                    animate={{ 
                      scale: selectedMode === mode.id ? [1, 1.1, 1] : 1,
                      color: selectedMode === mode.id ? mode.color : '#FFFFFF'
                    }}
                    transition={{ 
                      duration: 1,
                      repeat: selectedMode === mode.id ? Infinity : 0,
                      repeatType: 'loop'
                    }}
                    className="flex justify-center mb-4"
                  >
                    <mode.icon size={48} />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2 font-['Inter']" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {mode.title}
                  </h3>
                  <p className="text-[#00A896]/80">{mode.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Start Case Button - Positioned bottom-right */}
            <div className="absolute bottom-8 right-8">
              <motion.button
                onClick={handleStartCase}
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 168, 150, 0.7)' }}
                whileTap={{ scale: 0.95 }}
                disabled={!selectedMode}
                className={`px-8 py-4 rounded-2xl text-white font-bold font-['Inter'] shadow-lg transition-all ${
                  selectedMode 
                    ? 'bg-gradient-to-r from-[#00A896] to-[#028090] shadow-[#00A896]/50' 
                    : 'bg-gray-500 cursor-not-allowed'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Start Case
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Panel - Rotating DNA Helix Animation */}
        <div className="w-1/3 hidden lg:flex flex-col items-center justify-center p-8 relative">
          <motion.div
            className="relative w-48 h-96"
            animate={{ rotateY: 360 }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {/* DNA Helix Structure */}
            <div className="absolute inset-0 flex flex-col justify-between py-8">
              {/* Helix elements */}
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="flex justify-center"
                  animate={{ 
                    scale: [1, 1.3, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'loop',
                    delay: i * 0.2
                  }}
                >
                  <div className="w-2 h-2 bg-[#00A896] rounded-full"></div>
                </motion.div>
              ))}
              
              {/* Connecting lines */}
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-16 h-0.5 bg-[#00A896]/50"
                  style={{ top: `${(i + 1) * 10}%`, left: '50%', transform: 'translateX(-50%)' }}
                  animate={{ 
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'loop',
                    delay: i * 0.2
                  }}
                ></motion.div>
              ))}
            </div>
            
            {/* Outer structure */}
            <div className="absolute inset-0 border-2 border-[#00A896]/30 rounded-3xl"></div>
            
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(0, 168, 150, 0.3)",
                  "0 0 0 15px rgba(0, 168, 150, 0)",
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop'
              }}
            />
          </motion.div>
          
          <motion.p
            className="mt-6 text-[#00A896] text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Molecular Structure <br /> Visualization
          </motion.p>
        </div>
      </div>
    </div>
  );
}