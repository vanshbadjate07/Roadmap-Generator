import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Clock, BookOpen, Code, Trophy, Share2, Globe, CheckCircle2, ChevronRight, Layout, Heart, X, ExternalLink, ShieldCheck, Copy, BookmarkPlus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Custom Node Component - Premium Gold/Black Theme
const CustomNode = ({ data, selected }) => {
    const isConcept = data.type === 'Concept';
    const isProject = data.type === 'Project';
    const isMilestone = data.type === 'Milestone';

    // Node Styles
    let containerClass = "w-80 rounded-xl p-5 shadow-2xl transition-all duration-300 ";
    let iconClass = "";

    // Selection Halo
    if (selected) {
        containerClass += "ring-2 ring-primary ring-offset-2 ring-offset-black scale-105 ";
    } else {
        containerClass += "hover:scale-[1.02] ";
    }

    if (isConcept) {
        containerClass += "bg-card border border-primary/20 hover:border-primary/50";
        iconClass = "text-primary";
    } else if (isProject) {
        containerClass += "bg-gray-900/80 backdrop-blur-md border border-white/10 hover:border-white/30";
        iconClass = "text-white";
    } else if (isMilestone) {
        containerClass += "bg-gradient-to-br from-primary/10 to-primary/5 border border-primary text-white";
        iconClass = "text-primary";
    }

    const Icon = isProject ? Code : isMilestone ? Trophy : BookOpen;

    return (
        <div className={containerClass}>
            <Handle type="target" position={Position.Top} className="!bg-gray-500 !w-2 !h-2" />

            <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${isMilestone ? 'border-primary/30 bg-primary/10 text-primary' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                    {data.type}
                </span>
                <span className="text-gray-500 text-xs font-mono flex items-center gap-1">
                    <Clock size={10} /> {data.time_allocation || data.time}
                </span>
            </div>

            <div className="flex gap-4">
                <div className={`mt-1 p-2.5 rounded-lg bg-black/40 h-fit border border-white/5`}>
                    <Icon size={18} className={iconClass} />
                </div>
                <div>
                    <h3 className={`font-heading font-bold text-base mb-1.5 leading-tight ${isMilestone ? 'text-primary' : 'text-gray-100'}`}>
                        {data.label}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 font-medium">
                        {data.description}
                    </p>
                </div>
            </div>

            {/* Click Hint */}
            <div className="mt-3 flex justify-end">
                <span className="text-[10px] text-primary/50 uppercase tracking-widest flex items-center gap-1">
                    Details <ChevronRight size={10} />
                </span>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-gray-500 !w-2 !h-2" />
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

const RoadmapView = () => {
    const { id } = useParams();
    const location = useLocation();

    // Data State
    const [roadmap, setRoadmap] = useState(location.state?.roadmap || null);
    const [loading, setLoading] = useState(!location.state?.roadmap);
    const { currentUser } = useAuth();

    // UI State
    const [selectedNode, setSelectedNode] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    // React Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // If preview mode, data MUST be in state
        if (id === 'preview') {
            if (location.state?.roadmap) {
                setRoadmap(location.state.roadmap);
                setLoading(false);
            } else {
                // Invalid preview access
                navigate('/');
            }
            return;
        }

        // Standard Fetch for existing IDs
        if (location.state?.roadmap && !roadmap?.steps) return;

        const fetchRoadmap = async () => {
            if (location.state?.roadmap) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`/api/roadmaps/${id}`);
                setRoadmap(res.data);
            } catch (err) {
                console.error("Failed to fetch roadmap", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoadmap();
    }, [id, location.state, navigate]);

    // View Counting (Skip for preview)
    useEffect(() => {
        if (id === 'preview') return;

        const incrementView = async () => {
            try {
                await axios.post(`/api/roadmaps/${id}/view`);
            } catch (err) {
                // console.error("Failed to track view", err);
            }
        };
        incrementView();
    }, [id]);

    useEffect(() => {
        if (currentUser && roadmap) {
            if (roadmap.likedBy) setIsLiked(roadmap.likedBy.includes(currentUser.uid));
            if (roadmap.savedBy) setIsSaved(roadmap.savedBy.includes(currentUser.uid));
        }
    }, [currentUser, roadmap]);

    // Graph Generation Effect
    useEffect(() => {
        if (!roadmap?.steps) return;

        const newNodes = [];
        const newEdges = [];
        let yPos = 0;
        const xPos = 0; // Centered

        roadmap.steps.forEach((step, index) => {
            // Node
            const nodeId = `node-${index}`;
            newNodes.push({
                id: nodeId,
                type: 'custom',
                position: { x: xPos, y: yPos },
                data: {
                    ...step,
                    label: step.title, // Ensure label exists
                    type: step.type || 'Concept'
                }
            });

            // Edge (Connect to previous)
            if (index > 0) {
                newEdges.push({
                    id: `edge-${index}`,
                    source: `node-${index - 1}`,
                    target: nodeId,
                    type: 'default',
                    animated: true,
                    style: { stroke: '#ffffff', strokeWidth: 2, opacity: 0.5 }
                });
            }

            // Increment Y Position
            yPos += 200; // Vertical spacing
        });

        // Add "Start" and "End" nodes optionally, or just keep it simple

        setNodes(newNodes);
        setEdges(newEdges);
    }, [roadmap, setNodes, setEdges]);

    // Handlers
    const onNodeClick = useCallback((event, node) => {
        setSelectedNode(node.data);
    }, []);

    const handlePublish = async () => {
        if (!currentUser) return;
        try {
            const token = await currentUser.getIdToken();
            await axios.post(`/api/roadmaps/${id}/publish`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoadmap(prev => ({ ...prev, isPublic: true }));
            alert("Roadmap Posted to Community!");
        } catch (err) {
            console.error("Failed to publish", err);
            alert("Failed to publish.");
        }
    };

    const handleLike = async () => {
        if (!currentUser) {
            alert("Please login to like roadmaps.");
            return;
        }
        try {
            const token = await currentUser.getIdToken();
            const res = await axios.post(`/api/roadmaps/${id}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Optimistic Update
            setRoadmap(prev => ({
                ...prev,
                likes: prev.likes + (res.data.liked ? 1 : -1)
            }));
            setIsLiked(res.data.liked);
        } catch (err) {
            console.error("Failed to like", err);
            const msg = err.response?.data?.error || err.message;
            alert(`Failed to like: ${msg}`);
        }
    };

    const handleBookmark = async () => {
        if (!currentUser) {
            alert("Please login to save roadmaps.");
            return;
        }
        try {
            const token = await currentUser.getIdToken();
            const res = await axios.post(`/api/roadmaps/${id}/bookmark`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsSaved(res.data.saved);
            // alert(res.data.message); 
        } catch (err) {
            console.error("Failed to bookmark", err);
            alert("Failed to save to profile.");
        }
    };

    const handleDelete = async () => {
        if (!currentUser) return;
        if (!window.confirm("Are you sure you want to delete this roadmap? This cannot be undone.")) return;

        try {
            const token = await currentUser.getIdToken();
            await axios.delete(`/api/roadmaps/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Roadmap deleted.");
            navigate('/profile');
        } catch (err) {
            console.error("Failed to delete", err);
            alert("Failed to delete roadmap.");
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied!");
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white"><Clock className="animate-spin mr-2" /> Loading...</div>;
    if (!roadmap) return <div className="min-h-screen flex items-center justify-center text-white">Roadmap not found</div>;

    const isOwner = currentUser?.uid === roadmap.authorId;

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-dark relative">

            {/* LEFT SIDEBAR - Meta & Actions */}
            <div className="w-80 border-r border-white/5 bg-dark/50 backdrop-blur-xl p-6 flex flex-col z-20 shadow-2xl relative">

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto -mr-3 pr-3 custom-scrollbar">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${roadmap.level === 'Beginner' ? 'border-green-500/30 text-green-400' :
                                roadmap.level === 'Intermediate' ? 'border-yellow-500/30 text-yellow-400' :
                                    'border-red-500/30 text-red-400'
                                }`}>
                                {roadmap.level}
                            </span>
                        </div>

                        <h1 className="text-2xl font-heading font-bold text-white mb-2 leading-tight">
                            {roadmap.title}
                        </h1>
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-mono uppercase tracking-widest mt-4">
                            <span className="flex items-center gap-1"><Clock size={12} /> {roadmap.estimated_total_time}</span>
                            <span className="flex items-center gap-1 text-primary"><Heart size={12} /> {roadmap.likes || 0} Likes</span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-400 leading-relaxed font-light mb-8 border-b border-white/5 pb-8">
                        {roadmap.description}
                    </p>
                </div>

                {/* Fixed Actions API                    {/* CONDITIONAL ACTION BUTTONS */}
                {id === 'preview' ? (
                    /* PREVIEW MODE ACTIONS */
                    <div className="mt-auto pt-6 border-t border-white/10">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4 text-center">
                            <p className="text-yellow-500 font-bold text-sm mb-1">PREVIEW MODE</p>
                            <p className="text-gray-400 text-xs">This roadmap is not saved yet.</p>
                        </div>

                        <button
                            onClick={async () => {
                                if (!currentUser) {
                                    alert("Please login to save.");
                                    return;
                                }
                                try {
                                    // Save to DB
                                    const res = await axios.post('/api/save', {
                                        roadmap: roadmap,
                                        userId: currentUser.uid
                                    });
                                    // Redirect to real URL
                                    navigate(`/roadmap/${res.data.id}`, { replace: true });
                                } catch (err) {
                                    alert("Failed to save roadmap.");
                                }
                            }}
                            className="w-full py-4 rounded-xl font-bold text-sm tracking-wide bg-primary hover:bg-secondary text-black shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={18} /> SAVE TO PROFILE
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3 mt-3 rounded-xl font-bold text-sm tracking-wide text-gray-500 hover:text-white transition-all"
                        >
                            DISCARD
                        </button>
                    </div>
                ) : (
                    /* NORMAL MODE ACTIONS */
                    <div className="mt-auto space-y-3 pt-6 border-t border-white/10">
                        {isOwner ? (
                            <>
                                <button
                                    onClick={handlePublish}
                                    disabled={roadmap.isPublic}
                                    className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${roadmap.isPublic
                                        ? 'bg-primary/10 text-primary border border-primary/20 cursor-default'
                                        : 'bg-white text-black hover:bg-gray-200 border border-white'
                                        }`}
                                >
                                    {roadmap.isPublic ? <Globe size={16} /> : <Share2 size={16} />}
                                    {roadmap.isPublic ? "PUBLISHED (PUBLIC)" : "POST TO COMMUNITY"}
                                </button>

                                <button
                                    onClick={handleDelete}
                                    className="w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500 mt-2"
                                >
                                    <Trash2 size={16} /> DELETE ROADMAP
                                </button>
                            </>
                        ) : (
                            currentUser && (
                                <button
                                    onClick={handleBookmark}
                                    className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${isSaved
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                        : 'bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/5'
                                        }`}
                                >
                                    {isSaved ? <CheckCircle2 size={16} /> : <BookmarkPlus size={16} />}
                                    {isSaved ? "SAVED IN PROFILE" : "SAVE TO PROFILE"}
                                </button>
                            )
                        )}

                        <button
                            onClick={copyLink}
                            className="w-full py-3 rounded-xl font-bold text-xs tracking-wide text-gray-500 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Share2 size={14} /> SHARE LINK
                        </button>
                    </div>
                )}
            </div>

            {/* GRAPH CANVAS */}
            <div className="flex-1 h-full bg-dark relative">
                {/* Dotted Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.5}
                    maxZoom={1.5}
                    attributionPosition="bottom-right"
                    proOptions={{ hideAttribution: true }}
                    style={{ width: '100%', height: '100%' }}
                >
                    <Background color="#ffffff" gap={40} size={1} style={{ opacity: 0.0 }} />
                    <Controls className="!bg-card !border-white/10 !fill-gray-400 hover:!bg-white/5" />
                </ReactFlow>
            </div>

            {/* RIGHT SIDEBAR - DETAILS PANEL (Slide-over) */}
            <div className={`absolute right-0 top-0 h-full w-[400px] bg-card/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-out z-30 flex flex-col ${selectedNode ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedNode ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-start">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">{selectedNode.type}</span>
                                <h2 className="text-xl font-heading font-bold text-white leading-tight">{selectedNode.title || selectedNode.label}</h2>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content Scroll */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* Time Allocation */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Clock size={20} /></div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Estimated Time</div>
                                    <div className="text-sm font-bold text-white">{selectedNode.time_allocation || selectedNode.estimated_time}</div>
                                </div>
                            </div>

                            {/* Detailed Notes */}
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <BookOpen size={14} className="text-primary" /> Deep Dive
                                </h3>
                                <div className="text-gray-300 text-sm leading-7 font-light">
                                    {selectedNode.detailedNotes || selectedNode.description || "No detailed notes available for this step."}
                                </div>
                            </div>

                            {/* Outcomes */}
                            {selectedNode.outcomes && (
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Trophy size={14} className="text-yellow-500" /> Key Outcomes
                                    </h3>
                                    <div className="p-4 bg-gray-900 rounded-xl border border-white/5 text-sm text-gray-400">
                                        {selectedNode.outcomes}
                                    </div>
                                </div>
                            )}

                            {/* Resources */}
                            {selectedNode.resources && selectedNode.resources.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <ExternalLink size={14} className="text-blue-400" /> Resources
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedNode.resources.map((res, i) => (
                                            <a
                                                key={i}
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{res.label}</span>
                                                    <ExternalLink size={12} className="text-gray-600 group-hover:text-primary transition-colors" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-600 p-10 text-center">
                        <div>
                            <Layout size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Select a module from the roadmap to view detailed personalized guidance.</p>
                        </div>
                    </div>
                )}
            </div>

        </div >
    );
};

export default RoadmapView;
