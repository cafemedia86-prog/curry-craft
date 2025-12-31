import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { ShieldCheck, User, Lock, Mail, Key, UserPlus, X, Phone } from 'lucide-react';

interface LoginModalProps {
    onClose?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const { login, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState<UserRole>('USER');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const { error } = await login(email, password);
                if (error) setError(error.message);
            } else {
                const { error } = await signUp(email, password, name, phone, 'USER');
                if (error) setError(error.message);
                else {
                    setIsLogin(true); // Switch to login after successful signup
                    if (onClose) onClose();
                }
            }
            if (!error && isLogin && onClose) {
                onClose();
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pb-24 overflow-y-auto">
            <div
                className="absolute inset-0 bg-[#022c22]/90 backdrop-blur-xl cursor-pointer"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-green-900/40 border border-green-800/50 p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300 my-auto">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-green-400/40 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-amber-500" size={28} />
                    </div>
                    <h2 className="text-2xl font-serif text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Join Curry Craft'}
                    </h2>
                    <p className="text-green-400/60 text-sm">
                        {isLogin ? 'Enter your credentials to continue' : 'Create your royal account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="text-[10px] font-bold text-green-400/40 uppercase tracking-widest mb-1.5 block">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/40" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#034435] border border-green-800/30 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                    placeholder="Maharaja Gupta"
                                />
                            </div>
                        </div>
                    )}

                    {!isLogin && (
                        <div>
                            <label className="text-[10px] font-bold text-green-400/40 uppercase tracking-widest mb-1.5 block">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/40" size={18} />
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-[#034435] border border-green-800/30 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-bold text-green-400/40 uppercase tracking-widest mb-1.5 block">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/40" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#034435] border border-green-800/30 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                placeholder="royalty@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-green-400/40 uppercase tracking-widest mb-1.5 block">Password</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/40" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#034435] border border-green-800/30 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-400 text-xs py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg">{error}</div>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>{isLogin ? 'Login' : 'Create Account'}</>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-green-400/60 hover:text-amber-500 text-sm font-medium transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div >
        </div >
    );
};

export default LoginModal;
