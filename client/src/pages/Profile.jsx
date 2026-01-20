import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import SettingsModal from '../components/SettingsModal';
import { Clock, BookOpen, Trash2, ArrowRight, Eye, Archive, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const { currentUser, logout } = useAuth();
    const [savedRoadmaps, setSavedRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        const fetchData = async () => {
            try {
                const token = await currentUser.getIdToken();
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Only fetch Saved Roadmaps (which includes Created ones now)
                const res = await axios.get('/api/saved', config);
                setSavedRoadmaps(res.data);
            } catch (err) {
                console.error("Failed to fetch profile data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    if (!currentUser) return <div className="text-center py-20 text-gray-400">Please login to view profile.</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 hover:bg-primary/30 rounded-full blur-xl transition-all"></div>
                    <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-gray-900 relative z-10"
                    />
                </div>
                <div className="text-center md:text-left flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        <div>
                            <h1 className="text-4xl font-bold font-heading text-white">{currentUser.displayName}</h1>
                            <p className="text-gray-400 font-mono text-sm mb-4">{currentUser.email}</p>
                        </div>

                        <div className="flex gap-3 justify-center md:justify-start">
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm flex items-center gap-2 transition-all"
                            >
                                <Settings size={16} /> Settings
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-bold text-sm flex items-center gap-2 transition-all"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    </div>

                    <div className="bg-card border border-white/5 px-6 py-3 rounded-xl inline-block text-center md:text-left">
                        <span className="block text-2xl font-bold text-primary mb-1">{savedRoadmaps.length}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-widest">Saved Roadmaps</span>
                    </div>
                </div>
            </div>

            <div className="mb-8 border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">My Collection</h2>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Retrieving archives...</div>
            ) : savedRoadmaps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Card */}
                    <Link to="/" className="block h-full min-h-[250px]">
                        <div className="h-full border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-600 hover:border-primary/50 hover:text-primary transition-all group cursor-pointer bg-white/5 hover:bg-white/10">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ArrowRight size={24} />
                            </div>
                            <span className="font-bold text-sm tracking-widest uppercase">Start New Path</span>
                        </div>
                    </Link>

                    {savedRoadmaps.map((roadmap) => (
                        <Link key={roadmap.id} to={`/roadmap/${roadmap.id}`} className="group block h-full">
                            <div className="h-full bg-card border border-white/5 rounded-2xl p-6 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 flex flex-col relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="relative z-10 flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${roadmap.level === 'Beginner' ? 'border-green-500/30 text-green-400 bg-green-500/5' :
                                        roadmap.level === 'Intermediate' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5' :
                                            'border-red-500/30 text-red-400 bg-red-500/5'
                                        }`}>
                                        {roadmap.level}
                                    </span>
                                    {roadmap.isPublic && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/30 px-2 py-1 rounded bg-primary/10">
                                            Public
                                        </span>
                                    )}
                                </div>

                                <h3 className="relative z-10 text-xl font-bold mb-2 line-clamp-2 text-white group-hover:text-primary transition-colors">
                                    {roadmap.title}
                                </h3>
                                <p className="relative z-10 text-gray-500 text-sm mb-6 line-clamp-3 flex-grow font-light">
                                    {roadmap.description}
                                </p>

                                <div className="relative z-10 flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/5 mt-auto font-mono">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5">
                                            <BookOpen size={12} /> {roadmap.steps?.length || 0}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={12} /> {roadmap.estimated_total_time}
                                        </span>
                                    </div>
                                    <span className="group-hover:translate-x-1 transition-transform text-white">
                                        <ArrowRight size={14} />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/5">
                    <Archive size={48} className="mx-auto text-gray-600 mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">No Saved Roadmaps</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Generate a new roadmap or save one from the community.
                    </p>
                    <Link to="/" className="bg-primary hover:bg-white text-black font-bold px-8 py-3 rounded-xl transition-all inline-flex items-center gap-2">
                        GENERATE NOW <ArrowRight size={16} />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Profile;
