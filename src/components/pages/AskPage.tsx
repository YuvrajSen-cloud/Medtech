import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Send, User as UserIcon, BookOpen, Clock, CheckCircle, Sparkles, Heart, Brain, Stethoscope, Bot, Zap, TrendingUp } from 'lucide-react';
import { PrimaryButton } from '../ui/PrimaryButton';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  citation?: string;
  timestamp: string;
}

interface ProfessorQuery {
  id: string;
  subject: string;
  question: string;
  status: 'pending' | 'answered';
  timestamp: string;
  answer?: string;
  professor?: string;
}

export function AskPage() {
  const [activeTab, setActiveTab] = useState<'medibot' | 'professor'>('medibot');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: "Hello! I'm MediBot, your AI-powered medical learning assistant. I can help you understand complex medical concepts, clarify doubts, and provide instant answers. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const quickSuggestions = [
    { icon: Heart, text: 'Explain cardiac cycle phases', color: '#EF476F', category: 'Cardiology' },
    { icon: Brain, text: 'Neurotransmitter types', color: '#00A896', category: 'Neuroscience' },
    { icon: Stethoscope, text: 'COPD vs Asthma differences', color: '#FFD166', category: 'Pulmonology' },
    { icon: Zap, text: 'Fluid and electrolyte balance', color: '#00A896', category: 'Physiology' },
    { icon: TrendingUp, text: 'Stages of wound healing', color: '#EF476F', category: 'Pathology' },
    { icon: Bot, text: 'Antibiotics mechanism of action', color: '#FFD166', category: 'Pharmacology' },
  ];

  const [professorQueries, setProfessorQueries] = useState<ProfessorQuery[]>([
    {
      id: '1',
      subject: 'Cardiovascular Physiology',
      question: 'Can you explain the Frank-Starling mechanism in detail?',
      status: 'answered',
      timestamp: '2 hours ago',
      answer: 'The Frank-Starling mechanism describes the relationship between stroke volume and end-diastolic volume...',
      professor: 'Dr. James Wilson',
    },
    {
      id: '2',
      subject: 'Pharmacology',
      question: 'What are the key differences between ACE inhibitors and ARBs?',
      status: 'pending',
      timestamp: '1 day ago',
    },
  ]);

  const [askProfessorForm, setAskProfessorForm] = useState({
    subject: '',
    question: '',
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: generateMockResponse(input),
        citation: 'Reference: Harrison\'s Principles of Internal Medicine, 21st Edition',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1500);
  };

  const generateMockResponse = (query: string) => {
    return `Based on your question about "${query}", here's a comprehensive explanation: This is a simulated AI response. In production, this would be powered by a medical AI model trained on verified medical literature and textbooks. The system would provide accurate, evidence-based answers with proper citations.`;
  };

  const handleAskProfessor = () => {
    if (!askProfessorForm.subject || !askProfessorForm.question) return;

    const newQuery: ProfessorQuery = {
      id: Date.now().toString(),
      subject: askProfessorForm.subject,
      question: askProfessorForm.question,
      status: 'pending',
      timestamp: 'Just now',
    };

    setProfessorQueries((prev) => [newQuery, ...prev]);
    setAskProfessorForm({ subject: '', question: '' });
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    // Auto-send after a short delay
    setTimeout(() => {
      setInput(text);
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: generateMockResponse(text),
          citation: 'Reference: Harrison\'s Principles of Internal Medicine, 21st Edition',
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }, 1500);
    }, 100);
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-3 bg-card border-2 border-border p-2 rounded-3xl shadow-lg"
          >
            <motion.button
              onClick={() => setActiveTab('medibot')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all relative overflow-hidden ${
                activeTab === 'medibot'
                  ? 'bg-gradient-to-br from-[#00A896] to-[#028090] text-white shadow-xl shadow-[#00A896]/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {activeTab === 'medibot' && (
                <motion.div
                  layoutId="tabBackground"
                  className="absolute inset-0 bg-gradient-to-br from-[#00A896] to-[#028090]"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <motion.div
                animate={activeTab === 'medibot' ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                <MessageCircle size={22} />
              </motion.div>
              <span className="relative z-10 font-medium">MediBot AI</span>
              {activeTab === 'medibot' && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 rounded-full bg-white relative z-10"
                />
              )}
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('professor')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all relative overflow-hidden ${
                activeTab === 'professor'
                  ? 'bg-gradient-to-br from-[#FFD166] to-[#FFD166]/80 text-white shadow-xl shadow-[#FFD166]/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {activeTab === 'professor' && (
                <motion.div
                  layoutId="tabBackground"
                  className="absolute inset-0 bg-gradient-to-br from-[#FFD166] to-[#FFD166]/80"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <motion.div
                animate={activeTab === 'professor' ? { rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                <BookOpen size={22} />
              </motion.div>
              <span className="relative z-10 font-medium">Ask Professor</span>
              {activeTab === 'professor' && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 rounded-full bg-white relative z-10"
                />
              )}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'medibot' ? (
            <motion.div
              key="medibot"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Chat Area */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-3 bg-card border-2 border-border rounded-3xl overflow-hidden flex flex-col shadow-xl"
                  style={{ height: '75vh' }}
                >
                  {/* Chat Header */}
                  <div className="p-6 border-b-2 border-border bg-gradient-to-r from-[#00A896]/10 to-[#028090]/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div
                          animate={{ 
                            boxShadow: [
                              '0 0 20px rgba(0, 168, 150, 0.3)',
                              '0 0 30px rgba(0, 168, 150, 0.5)',
                              '0 0 20px rgba(0, 168, 150, 0.3)',
                            ]
                          }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00A896] to-[#028090] flex items-center justify-center"
                        >
                          <Bot size={32} className="text-white" />
                        </motion.div>
                        <div>
                          <h2 className="flex items-center gap-2 mb-1">
                            MediBot Assistant
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="w-2.5 h-2.5 rounded-full bg-green-500"
                            />
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Online • AI-Powered Medical Expert
                          </p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                        className="text-[#00A896]"
                      >
                        <Sparkles size={28} />
                      </motion.div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <AnimatePresence>
                      {messages.map((message, idx) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: 'spring', damping: 20 }}
                          className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              message.role === 'bot'
                                ? 'bg-gradient-to-br from-[#00A896] to-[#028090]'
                                : 'bg-gradient-to-br from-[#FFD166] to-[#FFD166]/80'
                            }`}
                          >
                            {message.role === 'bot' ? (
                              <Bot size={24} className="text-white" />
                            ) : (
                              <UserIcon size={24} className="text-white" />
                            )}
                          </motion.div>
                          <div className={`flex-1 max-w-3xl ${message.role === 'user' ? 'text-right' : ''}`}>
                            <motion.div
                              whileHover={{ scale: 1.01, y: -2 }}
                              className={`inline-block p-5 rounded-2xl shadow-md ${
                                message.role === 'user'
                                  ? 'bg-gradient-to-br from-[#00A896] to-[#028090] text-white'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              <p className="text-base leading-relaxed">{message.content}</p>
                            </motion.div>
                            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                              <span>{message.timestamp}</span>
                              {message.citation && (
                                <>
                                  <span>•</span>
                                  <span>{message.citation}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Typing Indicator */}
                    <AnimatePresence>
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="flex gap-4"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A896] to-[#028090] flex items-center justify-center">
                            <Bot size={24} className="text-white" />
                          </div>
                          <div className="bg-muted p-5 rounded-2xl">
                            <div className="flex gap-2">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  animate={{ 
                                    y: [0, -10, 0],
                                    opacity: [0.5, 1, 0.5]
                                  }}
                                  transition={{ 
                                    repeat: Infinity, 
                                    duration: 1,
                                    delay: i * 0.2
                                  }}
                                  className="w-2.5 h-2.5 rounded-full bg-[#00A896]"
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Input */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 border-t-2 border-border bg-gradient-to-br from-muted/30 to-background"
                  >
                    <div className="flex gap-3 mb-3">
                      <div className="flex-1 relative">
                        <motion.input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="Ask me anything about medicine..."
                          whileFocus={{ scale: 1.01 }}
                          className="w-full px-6 py-4 rounded-2xl bg-background border-2 border-border focus:outline-none focus:border-[#00A896] transition-all shadow-sm text-base"
                        />
                        <AnimatePresence>
                          {input && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded"
                            >
                              Press Enter
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <motion.button
                        onClick={handleSend}
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-gradient-to-br from-[#00A896] to-[#028090] text-white rounded-2xl flex items-center gap-2 shadow-lg shadow-[#00A896]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!input.trim()}
                      >
                        <Send size={20} />
                        <span className="hidden sm:inline">Send</span>
                      </motion.button>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-2 h-2 rounded-full bg-green-500"
                      />
                      <p className="text-xs text-muted-foreground">
                        MediBot uses AI to provide educational responses. Always verify critical information.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Quick Suggestions Sidebar */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={18} className="text-[#FFD166]" />
                      <h3 className="text-sm">Quick Topics</h3>
                    </div>
                    <div className="space-y-3">
                      {quickSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.05, x: 5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSuggestionClick(suggestion.text)}
                          className="w-full p-4 bg-muted border-2 border-border rounded-xl hover:border-[#00A896] transition-all text-left group"
                        >
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: `${suggestion.color}20` }}
                          >
                            <suggestion.icon size={18} style={{ color: suggestion.color }} />
                          </div>
                          <p className="text-xs mb-1 text-muted-foreground">{suggestion.category}</p>
                          <p className="text-sm leading-snug">{suggestion.text}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="professor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Ask Professor Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border-2 border-border rounded-2xl p-6 shadow-lg"
              >
                <h2 className="mb-4">Submit a Question to Professors</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm mb-2 block">Subject/Topic</label>
                    <Input
                      placeholder="e.g., Cardiovascular System, Pharmacology"
                      value={askProfessorForm.subject}
                      onChange={(e) => setAskProfessorForm({ ...askProfessorForm, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">Your Question</label>
                    <Textarea
                      placeholder="Describe your question in detail. Include any relevant context..."
                      rows={5}
                      className="resize-none"
                      value={askProfessorForm.question}
                      onChange={(e) => setAskProfessorForm({ ...askProfessorForm, question: e.target.value })}
                    />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex items-start gap-3 p-4 bg-muted rounded-xl"
                  >
                    <Clock size={20} className="text-[#FFD166] mt-1" />
                    <div className="text-sm">
                      <p className="mb-1">Expected Response Time: 12-24 hours</p>
                      <p className="text-muted-foreground text-xs">
                        Questions are reviewed by available professors. You'll receive a notification when answered.
                      </p>
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <PrimaryButton onClick={handleAskProfessor} className="w-full">
                      Submit Question
                    </PrimaryButton>
                  </motion.div>
                </div>
              </motion.div>

              {/* Previous Queries */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="mb-4">Your Questions</h2>
                <div className="space-y-4">
                  {professorQueries.map((query, index) => (
                    <motion.div
                      key={query.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, x: 5 }}
                      className="bg-card border-2 border-border rounded-2xl p-6 shadow-md hover:shadow-lg hover:border-[#00A896] transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-foreground">{query.subject}</h3>
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className={`px-3 py-1 rounded-full text-xs ${
                                query.status === 'answered'
                                  ? 'bg-green-500/20 text-green-500'
                                  : 'bg-[#FFD166]/20 text-[#FFD166]'
                              }`}
                            >
                              {query.status === 'answered' ? (
                                <><CheckCircle className="inline mr-1" size={12} /> Answered</>
                              ) : (
                                <><Clock className="inline mr-1" size={12} /> Pending</>
                              )}
                            </motion.span>
                          </div>
                          <p className="text-muted-foreground text-sm">{query.question}</p>
                        </div>
                      </div>

                      {query.answer && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 p-4 bg-muted rounded-xl"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00A896] to-[#028090] flex items-center justify-center text-white text-xs">
                              {query.professor?.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm">{query.professor}</p>
                              <p className="text-xs text-muted-foreground">{query.timestamp}</p>
                            </div>
                          </div>
                          <p className="text-sm text-foreground">{query.answer}</p>
                        </motion.div>
                      )}

                      {!query.answer && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted {query.timestamp}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
