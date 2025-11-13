import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Heart, Brain, Activity, Stethoscope, User, Clock, Target, Award, Filter, Search, ChevronDown } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CaseItem {
  case_id: string;
  difficulty: 'easy' | 'critical' | 'severe';
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
  title?: string; // Optional for backward compatibility
}

interface CaseLibraryPageProps {
  onNavigate: (page: string) => void;
}

export function CaseLibraryPage({ onNavigate }: CaseLibraryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Fetch cases from the backend
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/cases');
        if (!response.ok) {
          throw new Error(`Failed to fetch cases: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setCases(data);
      } catch (err: any) {
        console.error('Error fetching cases:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = 
      caseItem.chief_complaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.medical_history.some(history => 
        history.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesDifficulty = selectedDifficulty === 'all' || caseItem.difficulty === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortBy === 'title') {
      return a.chief_complaint.localeCompare(b.chief_complaint);
    } else if (sortBy === 'difficulty') {
      const difficultyOrder = { 'easy': 1, 'critical': 2, 'severe': 3 };
      return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
    }
    return 0;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'critical': return '#FFD166';
      case 'severe': return '#EF476F';
      default: return '#9CA3AF';
    }
  };

  const getDifficultyDisplay = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Easy';
      case 'critical': return 'Critical';
      case 'severe': return 'Severe';
      default: return difficulty;
    }
  };

  const getSpecialtyIcon = (chiefComplaint: string) => {
    if (chiefComplaint.toLowerCase().includes('chest') || chiefComplaint.toLowerCase().includes('heart')) {
      return Heart;
    } else if (chiefComplaint.toLowerCase().includes('head') || chiefComplaint.toLowerCase().includes('brain')) {
      return Brain;
    } else if (chiefComplaint.toLowerCase().includes('breath') || chiefComplaint.toLowerCase().includes('lung')) {
      return Activity;
    } else {
      return Stethoscope;
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
          <p className="text-lg">Loading cases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center p-8 bg-card rounded-2xl border border-destructive/50">
          <h2 className="text-2xl font-bold mb-4 text-destructive">Error Loading Cases</h2>
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
      <div className="max-w-7xl mx-auto">
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
              <p className="text-xs text-muted-foreground">Case Library</p>
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
          <h1 className="text-4xl font-bold mb-4">Case Library</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive collection of medical cases across specialties
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]/50"
                />
              </div>
            </div>

            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]/50"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="critical">Critical</option>
                <option value="severe">Severe</option>
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]/50"
              >
                <option value="title">Title</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Cases Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {sortedCases.map((caseItem, index) => {
            const IconComponent = getSpecialtyIcon(caseItem.chief_complaint);
            return (
              <motion.div
                key={caseItem.case_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A896]/20 to-[#028090]/20 flex items-center justify-center"
                      style={{ backgroundColor: `${getDifficultyColor(caseItem.difficulty)}20` }}
                    >
                      <IconComponent size={24} style={{ color: getDifficultyColor(caseItem.difficulty) }} />
                    </div>

                    <span
                      className="px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1"
                      style={{
                        backgroundColor: `${getDifficultyColor(caseItem.difficulty)}20`,
                        color: getDifficultyColor(caseItem.difficulty)
                      }}
                    >
                      {getDifficultyDisplay(caseItem.difficulty)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2">{caseItem.patient.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{caseItem.chief_complaint}</p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Age: {caseItem.patient.age}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Heart size={14} />
                        HR: {caseItem.vitals.hr}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Target size={14} />
                        BP: {caseItem.vitals.sbp}/{caseItem.vitals.dbp}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">Medical History: {caseItem.medical_history.join(', ')}</span>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => onNavigate('case-selection')}
                      className="w-full px-4 py-2 bg-gradient-to-r from-[#00A896] to-[#028090] text-white rounded-xl hover:opacity-90 transition-opacity text-sm"
                    >
                      Start Case
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {sortedCases.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
              <BookOpen size={48} className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No cases found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}