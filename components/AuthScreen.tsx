import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AppleIcon } from './IconComponents';

const AuthScreen = () => {
    const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
    const { login, signup } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Note: Password is not actually used for login in this mock
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { resolvedTheme } = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (activeTab === 'signin') {
                await login(email);
            } else {
                await signup(name, email);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const launcherLightBg = "D9E7F8";
    const launcherLightGradient = `radial-gradient(at 4% 6%, hsla(209, 87%, 83%, 1) 0px, transparent 50%), radial-gradient(at 93% 13%, hsla(202, 90%, 75%, 1) 0px, transparent 50%), radial-gradient(at 95% 94%, hsla(215, 82%, 81%, 1) 0px, transparent 50%), radial-gradient(at 5% 95%, hsla(209, 78%, 84%, 1) 0px, transparent 50%)`;
    const launcherDarkBg = "0f172a";
    const launcherDarkGradient = `radial-gradient(at 83% 8%, hsla(216, 38%, 13%, 1) 0px, transparent 50%), radial-gradient(at 16% 91%, hsla(218, 41%, 11%, 1) 0px, transparent 50%), radial-gradient(at 8% 13%, hsla(219, 44%, 18%, 1) 0px, transparent 50%)`;
    
    const dynamicStyle = {
        backgroundColor: `#${resolvedTheme === 'light' ? launcherLightBg : launcherDarkBg}`,
        backgroundImage: resolvedTheme === 'light' ? launcherLightGradient : launcherDarkGradient,
    };

    const inputClass = "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-[22px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-900 dark:text-gray-100";

    return (
        <div style={dynamicStyle} className="w-full h-screen flex flex-col items-center justify-center p-4">
             <div className="text-center mb-6">
                <AppleIcon className="w-10 h-10 mx-auto text-black dark:text-white" />
                <h1 className="text-3xl font-bold text-black dark:text-white mt-2">Welcome to Synergize</h1>
                <p className="text-gray-600 dark:text-gray-400">Your all-in-one workspace.</p>
            </div>
            <div className="w-full max-w-sm bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[22px] shadow-lg p-8">
                <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6">
                    <button onClick={() => setActiveTab('signin')} className={`w-1/2 py-3 text-sm font-semibold transition-colors ${activeTab === 'signin' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}>
                        Sign In
                    </button>
                    <button onClick={() => setActiveTab('signup')} className={`w-1/2 py-3 text-sm font-semibold transition-colors ${activeTab === 'signup' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}>
                        Create Account
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'signup' && (
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} required placeholder={activeTab === 'signin' ? "Any password will work" : "Create a password"} />
                    </div>
                    
                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button type="submit" disabled={loading} className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-[22px] font-semibold hover:bg-blue-500 transition-colors duration-200 shadow-lg shadow-blue-600/30 disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {loading ? 'Processing...' : (activeTab === 'signin' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>
                 <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">For demo: use 'alina.petrova@example.com' to sign in as an Admin.</p>
            </div>
        </div>
    );
};

export default AuthScreen;