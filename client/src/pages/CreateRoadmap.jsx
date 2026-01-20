import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Wand2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const CreateRoadmap = () => {
    const [searchParams] = useSearchParams();
    const initialTopic = searchParams.get('topic') || '';

    const [topic, setTopic] = useState(initialTopic);
    const [level, setLevel] = useState(LEVELS[0]);
    const [skills, setSkills] = useState('');
    const [goal, setGoal] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { currentUser } = useAuth(); // for auth token if needed, though generate is currently public-ish but needs auth to save

    // If we want to implement "Login REQUIRED to generate", we are already protected by ProtectedRoute

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // In a real app, we might pass the token to /generate too if we want to rate limit per user
            // const token = await currentUser.getIdToken();

            const response = await axios.post('/api/generate', {
                topic,
                level,
                skills,
                goal
            });

            const roadmapData = response.data;

            // For now, we'll navigate to a "preview" state or save immediately?
            // The requirement says "Actions: Save roadmap". So effectively we should probably 
            // Show the roadmap in a "preview" mode (RoadmapView with local data) or save it as a draft.
            // Let's save it as a draft (private) immediately for simplicity, 
            // OR pass the data via state to RoadmapView.
            // better: Save it immediately to Firestore so it has an ID.

            const token = await currentUser.getIdToken();
            const saveResponse = await axios.post('/api/save', {
                roadmap: { ...roadmapData, topic, level, knownSkills: skills },
                userId: currentUser.uid
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Small delay to ensure consistency
            navigate(`/roadmap/${saveResponse.data.id}`, {
                state: {
                    roadmap: { ...roadmapData, topic, level, knownSkills: skills, id: saveResponse.data.id }
                }
            });

        } catch (err) {
            console.error("Generation failed", err);
            setError(err.response?.data?.error || "Failed to generate roadmap. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Generate Your Learning Path</h1>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 mb-2 font-medium">What do you want to learn?</label>
                        <input
                            type="text"
                            required
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Full Stack Development"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 mb-2 font-medium">Experience Level</label>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-primary outline-none appearance-none"
                            >
                                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 font-medium">Timeline / Goal (Optional)</label>
                            <input
                                type="text"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-primary outline-none"
                                placeholder="e.g. 3 months, or 'Get a job'"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-2 font-medium">Known Skills (Optional)</label>
                        <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-primary outline-none"
                            placeholder="e.g. HTML, CSS, JavaScript"
                        />
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Generating Magic...
                            </>
                        ) : (
                            <>
                                <Wand2 size={20} />
                                Generate Roadmap
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateRoadmap;
