import React, { useState, useEffect } from 'react';
import { X, Key, Save, Trash2, Check } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const SettingsModal = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [saved, setSaved] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (isOpen) {
            const localKey = localStorage.getItem('user_gemini_key');
            if (localKey) {
                setApiKey(localKey);
            } else if (currentUser) {
                // Try fetching from DB if not in local
                const fetchKey = async () => {
                    try {
                        const token = await currentUser.getIdToken();
                        const res = await axios.get('/api/user/key', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (res.data.key) {
                            setApiKey(res.data.key);
                            localStorage.setItem('user_gemini_key', res.data.key);
                        }
                    } catch (e) {
                        console.error("Failed to fetch key", e);
                    }
                };
                fetchKey();
            }
        }
    }, [isOpen, currentUser]);

    const handleSave = async () => {
        if (apiKey.trim()) {
            const key = apiKey.trim();
            localStorage.setItem('user_gemini_key', key);

            // Persist to DB
            if (currentUser) {
                try {
                    const token = await currentUser.getIdToken();
                    await axios.post('/api/user/key', { key }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (e) {
                    console.error("Failed to save key to DB", e);
                }
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    const handleClear = async () => {
        localStorage.removeItem('user_gemini_key');
        setApiKey('');

        // Optional: We could also delete from DB, but usually keeping it in DB 
        // while clearing local is fine, or we can clear DB too.
        // For now, let's clear DB to be "true clear".
        if (currentUser) {
            try {
                const token = await currentUser.getIdToken();
                await axios.post('/api/user/key', { key: '' }, { // Send empty to clear? Or separate delete endpoint?
                    headers: { Authorization: `Bearer ${token}` } // Controller saves whatever we send.
                });
            } catch (e) { console.error("Failed to clear DB key", e); }
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-md relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Key className="text-primary" size={20} /> API Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Your Gemini API Key (Optional)</label>
                        <p className="text-xs text-gray-500">
                            Provide your own key to use your own quota. If empty, the app uses the host's key.
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                                Get a key here
                            </a>.
                        </p>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-all font-mono text-sm"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        {apiKey && (
                            <button
                                onClick={handleClear}
                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} /> Clear
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {saved ? <Check size={18} /> : <Save size={18} />} {saved ? "Saved!" : "Save Key"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
