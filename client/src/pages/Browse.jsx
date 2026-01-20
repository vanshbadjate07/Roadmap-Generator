import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Clock, BookOpen, User, Heart } from 'lucide-react';

const Browse = () => {
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRoadmaps = async () => {
            try {
                const res = await axios.get('/api/public');
                setRoadmaps(res.data);
            } catch (err) {
                console.error("Failed to fetch roadmaps", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoadmaps();
    }, []);

    const filteredRoadmaps = roadmaps.filter(r =>
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.topic?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Community Roadmaps</h1>
                <p className="text-gray-400 mb-8">Explore learning paths created by the community.</p>

                <div className="max-w-xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                    <div className="relative flex items-center bg-gray-900 border border-gray-800 rounded-xl p-2 shadow-2xl">
                        <Search className="text-gray-400 ml-3" size={20} />
                        <input
                            type="text"
                            className="w-full bg-transparent text-white p-3 focus:outline-none placeholder-gray-600"
                            placeholder="Search by topic or title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">Loading community roadmaps...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoadmaps.length > 0 ? (
                        filteredRoadmaps.map((roadmap) => (
                            <Link key={roadmap.id} to={`/roadmap/${roadmap.id}`} className="block h-full">
                                <div className="h-full bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-all hover:-translate-y-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${roadmap.level === 'Beginner' ? 'bg-green-500/10 text-green-500' :
                                            roadmap.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500' :
                                                'bg-red-500/10 text-red-500'
                                            }`}>
                                            {roadmap.level}
                                        </span>
                                        {/* <span className="text-gray-500 text-xs">{new Date(roadmap.createdAt).toLocaleDateString()}</span> */}
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{roadmap.title}</h3>
                                    <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-grow">{roadmap.description}</p>

                                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-800">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <BookOpen size={14} />
                                                {roadmap.steps?.length || 0}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {roadmap.estimated_total_time}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-primary font-medium">
                                            <Heart size={14} className={roadmap.likes > 0 ? "fill-primary" : ""} />
                                            {roadmap.likes || 0}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            No roadmaps found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Browse;
