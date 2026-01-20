import React, { useState, useRef, useEffect } from 'react';
import RoadmapLoader from '../components/RoadmapLoader';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Wand2, Sparkles, ChevronRight, X, Clock, Calendar, Target, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const COMMON_TOPICS = [
    "Python", "JavaScript", "React", "Node.js", "Data Science", "Machine Learning",
    "Digital Marketing", "SEO", "Graphic Design", "UI/UX Design", "Blockchain",
    "Cybersecurity", "Cloud Computing", "AWS", "Docker", "Kubernetes", "SQL",
    "Product Management", "Public Speaking", "Creative Writing", "Finance"
];

const SUGGESTIONS = [
    { label: "Python", desc: "Data Science & AI" },
    { label: "React", desc: "Modern Web Dev" },
    { label: "Machine Learning", desc: "AI & Neural Networks" },
    { label: "Digital Marketing", desc: "SEO & Content" }
];

const Home = () => {
    const navigate = useNavigate();
    const { currentUser, login } = useAuth();

    // Generation State
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState(LEVELS[0]);

    // Personalization State
    const [showConfig, setShowConfig] = useState(false);
    const [duration, setDuration] = useState('1 Month');
    const [hoursPerDay, setHoursPerDay] = useState('2');
    const [goal, setGoal] = useState('Mastery');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Community Feed State
    const [communityRoadmaps, setCommunityRoadmaps] = useState([]);

    // Auto-suggest State
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);

    // Filter suggestions based on input
    const filteredTopics = topic
        ? COMMON_TOPICS.filter(t => t.toLowerCase().includes(topic.toLowerCase())).slice(0, 5)
        : [];

    useEffect(() => {
        const fetchCommunity = async () => {
            try {
                const res = await axios.get('/api/public');
                setCommunityRoadmaps(res.data.slice(0, 3));
            } catch (err) {
                console.error("Failed to fetch community roadmaps", err);
            }
        };
        fetchCommunity();
    }, []);

    const handleStartClick = async (e) => {
        e.preventDefault();
        if (!topic) return;

        // 1. Authenticate first
        if (!currentUser) {
            try {
                await login();
                // After login, show config
                setShowConfig(true);
            } catch (authErr) {
                console.error("Auth cancelled/failed", authErr);
            }
        } else {
            setShowConfig(true);
        }
    };


    const confirmGeneration = async () => {
        setLoading(true);
        setError('');
        setShowConfig(false);

        try {
            const genResponse = await axios.post('/api/generate', {
                topic,
                level,
                goal,
                duration,
                hoursPerDay
            });
            const roadmapData = genResponse.data;

            // Navigate to PREVIEW mode without saving to DB yet
            navigate(`/roadmap/preview`, {
                state: {
                    roadmap: { ...roadmapData, topic, level },
                    isPreview: true
                }
            });

        } catch (err) {
            console.error("Process failed", err);
            setError("Something went wrong. Please try again.");
            setLoading(false);
            setShowConfig(true);
        }
    };

    return (
        <div className="min-h-screen bg-dark text-white font-sans selection:bg-primary/30 relative">
            {/* Geometric Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-white/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Improved Loading Overlay */}
            {loading && <RoadmapLoader topic={topic} />}

            {/* Personalization Modal ... (Keep same) ... */}
            {showConfig && !loading && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card w-full max-w-lg rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h3 className="text-xl font-bold font-heading text-white">Personalize Journey</h3>
                            <button onClick={() => setShowConfig(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Topic Readonly */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Selected Skill</label>
                                <div className="text-xl font-bold text-primary">{topic} <span className="text-gray-500 text-sm font-normal">({level})</span></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Timeline</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full bg-gray-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-3 focus:border-primary/50 focus:outline-none text-white text-sm"
                                            placeholder="e.g. 30 Days"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Commitment</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            value={hoursPerDay}
                                            onChange={(e) => setHoursPerDay(e.target.value)}
                                            className="w-full bg-gray-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-3 focus:border-primary/50 focus:outline-none text-white text-sm"
                                            placeholder="e.g. 2 Hours"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Primary Goal</label>
                                <div className="relative">
                                    <Target className="absolute left-3 top-3 text-gray-500" size={16} />
                                    <select
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        className="w-full bg-gray-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-3 focus:border-primary/50 focus:outline-none text-white text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="Mastery">Complete Mastery (Career Ready)</option>
                                        <option value="Project">Build a Specific Project</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowConfig(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
                            <button
                                onClick={confirmGeneration}
                                className="px-6 py-2 rounded-lg bg-primary hover:bg-secondary text-black font-bold text-sm transition-all shadow-lg shadow-primary/10 flex items-center gap-2"
                            >
                                <Wand2 size={16} /> GENERATE PLAN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative pt-32 pb-20 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
                    <Sparkles size={16} className="text-primary" />
                    <span className="text-sm font-medium tracking-wide text-gray-300">AI-POWERED LEARNING PATHS</span>
                </div>

                {/* Hero Title */}
                <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
                    Map Your Journey to <br />
                    <span className="text-gradient">Mastery</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
                    Stop guessing what to learn next. Get proper structure, curated resources, and clear milestones—generated instantly just for you.
                </p>

                {/* Main Input Card */}
                <div className="w-full max-w-3xl bg-card border border-white/10 p-2 rounded-2xl shadow-2xl shadow-primary/5 transform transition-all hover:border-primary/30 relative z-20">
                    <form onSubmit={handleStartClick} className="flex flex-col md:flex-row gap-2">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Wand2 className="text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={topic}
                                onChange={(e) => {
                                    setTopic(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay hide to allow click
                                placeholder="What skill do you want to master?"
                                className="w-full h-14 pl-12 pr-4 bg-transparent text-white font-medium placeholder-gray-600 focus:outline-none"
                                required
                                autoComplete="off"
                            />

                            {/* Auto-Suggestions Dropdown */}
                            {showSuggestions && filteredTopics.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-30">
                                    {filteredTopics.map((t, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                setTopic(t);
                                                setShowSuggestions(false);
                                            }}
                                            className="px-4 py-3 hover:bg-white/10 cursor-pointer text-left text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            <Sparkles size={12} className="text-primary/50" /> {t}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="h-px md:h-14 w-full md:w-px bg-white/10"></div>

                        <div className="flex items-center px-2">
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="bg-transparent text-sm font-medium text-gray-400 focus:text-white focus:outline-none cursor-pointer hover:text-white transition-colors py-2 md:py-0 w-full md:w-auto"
                            >
                                {LEVELS.map(l => <option key={l} value={l} className="bg-card text-white">{l}</option>)}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-secondary text-black font-bold h-14 px-8 rounded-xl transition-all flex items-center justify-center gap-2 min-w-[160px]"
                        >
                            GENERATE <ChevronRight size={18} />
                        </button>
                    </form>
                </div>

                {/* Suggestions */}
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {SUGGESTIONS.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => setTopic(s.label)}
                            className="bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-white/10 px-4 py-2 rounded-lg text-sm transition-all text-gray-400 hover:text-white flex items-center gap-2"
                        >
                            <span>{s.label}</span>
                        </button>
                    ))}
                </div>

                {error && <p className="mt-6 text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">{error}</p>}

            </div>

            {/* Community Section */}
            <div className="border-t border-white/5 bg-black/20 py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-2xl font-bold">Community Roadmaps</h2>
                        <button onClick={() => navigate('/browse')} className="text-primary text-sm font-bold hover:underline">VIEW ALL</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {communityRoadmaps.length > 0 ? (
                            communityRoadmaps.map((map) => (
                                <div key={map.id} onClick={() => navigate(`/roadmap/${map.id}`)} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-primary/30 transition-all cursor-pointer hover:-translate-y-1 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${map.level === 'Beginner' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {map.level}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{map.title}</h3>
                                    <p className="text-gray-400 text-sm mb-6 line-clamp-2">{map.description}</p>
                                    <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between text-gray-500 text-sm">
                                        <div className="flex items-center gap-2"><Clock size={14} /> {map.estimated_total_time}</div>
                                        <div className="flex items-center gap-1"><Heart size={14} /> {map.likes || 0}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 border border-dashed border-gray-800 rounded-xl bg-white/5">
                                <p className="text-gray-500">Loading trending paths...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
