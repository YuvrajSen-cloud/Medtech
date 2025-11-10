import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Heart, Brain, Activity, Stethoscope, User, Clock, Target, Award, Filter, Search, ChevronDown } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CaseItem {
  id: string;
  title: string;
  specialty: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  duration: string;
  rating: number;
  completed: boolean;
  cases: number;
}

interface CaseLibraryPageProps {
  onNavigate: (page: string) => void;
}

export function CaseLibraryPage({ onNavigate }: CaseLibraryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Mock data for cases
  const cases: CaseItem[] = [
    {
      id: 'anatomy-001',
      title: 'Anatomy Fundamentals',
      specialty: 'Anatomy',
      description: 'Basic anatomical structures and their functions',
      difficulty: 'Beginner',
      duration: '15 min',
      rating: 4.8,
      completed: true,
      cases: 12
    },
    {
      id: 'physiology-001',
      title: 'Cardiovascular Physiology',
      specialty: 'Physiology',
      description: 'Understanding heart function and circulation',
      difficulty: 'Intermediate',
      duration: '25 min',
      rating: 4.6,
      completed: false,
      cases: 18
    },
    {
      id: 'biochemistry-001',
      title: 'Metabolic Pathways',
      specialty: 'Biochemistry',
      description: 'Glycolysis, Krebs cycle, and oxidative phosphorylation',
      difficulty: 'Advanced',
      duration: '30 min',
      rating: 4.5,
      completed: false,
      cases: 15
    },
    {
      id: 'pathology-001',
      title: 'Cellular Injury',
      specialty: 'Pathology',
      description: 'Mechanisms of cellular damage and adaptation',
      difficulty: 'Intermediate',
      duration: '20 min',
      rating: 4.7,
      completed: true,
      cases: 20
    },
    {
      id: 'pharmacology-001',
      title: 'Cardiovascular Pharmacology',
      specialty: 'Pharmacology',
      description: 'Drugs affecting the cardiovascular system',
      difficulty: 'Advanced',
      duration: '35 min',
      rating: 4.9,
      completed: false,
      cases: 25
    },
    {
      id: 'microbiology-001',
      title: 'Bacterial Infections',
      specialty: 'Microbiology',
      description: 'Common bacterial pathogens and their treatment',
      difficulty: 'Intermediate',
      duration: '22 min',
      rating: 4.4,
      completed: false,
      cases: 17
    },
    {
      id: 'forensic-001',
      title: 'Death Investigation',
      specialty: 'Forensic Medicine',
      description: 'Approach to death scene investigation',
      difficulty: 'Advanced',
      duration: '40 min',
      rating: 4.3,
      completed: false,
      cases: 10
    },
    {
      id: 'preventive-001',
      title: 'Epidemiology Basics',
      specialty: 'Social and Preventive Medicine',
      description: 'Principles of disease prevention',
      difficulty: 'Beginner',
      duration: '18 min',
      rating: 4.2,
      completed: true,
      cases: 14
    }
  ];

  const specialties = [
    'All', 'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 
    'Pharmacology', 'Microbiology', 'Forensic Medicine', 
    'Social and Preventive Medicine', 'General Medicine', 
    'General Surgery', 'Obstetrics and Gynecology', 
    'Paediatrics', 'ENT', 'Ophthalmology'
  ];

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          caseItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || caseItem.specialty === selectedSpecialty;
    const matchesDifficulty = selectedDifficulty === 'all' || caseItem.difficulty === selectedDifficulty;

    return matchesSearch && matchesSpecialty && matchesDifficulty;
  });

  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else if (sortBy === 'difficulty') {
      const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    }
    return 0;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#FFD166';
      case 'Advanced': return '#EF476F';
      case 'Expert': return '#7C3AED';
      default: return '#9CA3AF';
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty) {
      case 'Anatomy': return Heart;
      case 'Physiology': return Heart;
      case 'Biochemistry': return Activity;
      case 'Pathology': return Stethoscope;
      case 'Pharmacology': return Stethoscope;
      case 'Microbiology': return Activity;
      case 'Forensic Medicine': return User;
      case 'Social and Preventive Medicine': return User;
      case 'General Medicine': return Stethoscope;
      case 'General Surgery': return Activity;
      case 'Obstetrics and Gynecology': return Heart;
      case 'Paediatrics': return User;
      case 'ENT': return User;
      case 'Ophthalmology': return User;
      default: return BookOpen;
    }
  };

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
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]/50"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty.toLowerCase() === 'all' ? 'all' : specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]/50"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty.toLowerCase() === 'all' ? 'all' : difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]/50"
              >
                <option value="title">Title</option>
                <option value="rating">Rating</option>
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
            const IconComponent = getSpecialtyIcon(caseItem.specialty);
            return (
              <motion.div
                key={caseItem.id}
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
                    
                    {caseItem.completed ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-600 text-xs font-medium rounded-full flex items-center gap-1">
                        <Award size={12} /> Completed
                      </span>
                    ) : (
                      <span 
                        className="px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1"
                        style={{ 
                          backgroundColor: `${getDifficultyColor(caseItem.difficulty)}20`,
                          color: getDifficultyColor(caseItem.difficulty)
                        }}
                      >
                        {caseItem.difficulty}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{caseItem.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{caseItem.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{caseItem.specialty}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock size={14} />
                        {caseItem.duration}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Target size={14} />
                        {caseItem.rating}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-sm">{caseItem.cases} cases</span>
                    <button
                      onClick={() => onNavigate('case-selection')}
                      className="px-4 py-2 bg-gradient-to-r from-[#00A896] to-[#028090] text-white rounded-xl hover:opacity-90 transition-opacity text-sm"
                    >
                      {caseItem.completed ? 'Review' : 'Start'}
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