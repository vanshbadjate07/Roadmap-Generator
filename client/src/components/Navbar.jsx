import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Plus, Search, User } from 'lucide-react';

const Navbar = () => {
    const { currentUser, login, logout } = useAuth();
    const navigate = useNavigate();

    const handleAuth = async () => {
        if (currentUser) {
            try {
                await logout();
                navigate('/');
            } catch (error) {
                console.error("Failed to log out", error);
            }
        } else {
            try {
                await login();
            } catch (error) {
                console.error("Failed to log in", error);
            }
        }
    };

    return (
        <nav className="border-b border-gray-800 bg-dark/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
                            <div className="w-5 h-5 border-2 border-primary rounded-sm transform rotate-45"></div>
                        </div>
                        <span className="font-heading font-bold text-xl tracking-wide text-white group-hover:text-primary transition-colors">
                            ROADMAP<span className="text-primary">.GEN</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <Link to="/browse" className="text-sm font-medium text-gray-400 hover:text-primary transition-colors uppercase tracking-wider">
                            Explore
                        </Link>

                        {currentUser ? (
                            <div className="relative group">
                                <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/50 px-4 py-2 rounded-xl transition-all">
                                    <img src={currentUser.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-black/20" />
                                    <span className="text-sm font-bold text-white hidden md:block">{currentUser.displayName?.split(' ')[0]}</span>
                                </button>

                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-48 bg-card border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                                    <Link to="/profile" className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white first:rounded-t-xl transition-colors">
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={handleAuth}
                                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 last:rounded-b-xl transition-colors border-t border-white/5"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleAuth}
                                className="flex items-center gap-2 bg-primary text-black px-6 py-2.5 rounded-lg hover:bg-white transition-all font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(255,215,0,0.1)] hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]"
                            >
                                <User size={16} />
                                <span>LOGIN</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
