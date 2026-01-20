import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, ArrowRight } from 'lucide-react';

const Login = () => {
    const { login, currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already logged in
    useEffect(() => {
        if (currentUser) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [currentUser, navigate, location]);

    const handleLogin = async () => {
        try {
            await login();
            // Navigation handled by useEffect
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto px-4 text-center">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl w-full">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User size={32} className="text-primary" />
                </div>

                <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                <p className="text-gray-400 mb-8">Sign in to save roadmaps, track progress, and publish your learning paths.</p>

                <button
                    onClick={handleLogin}
                    className="w-full bg-white text-dark font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-3"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                    Sign in with Google
                </button>
            </div>

            <p className="mt-8 text-gray-500 text-sm">
                By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
        </div>
    );
};

export default Login;
