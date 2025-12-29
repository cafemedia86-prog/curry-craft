import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserProfile, UserRole } from '../../context/AuthContext';
import { Search, UserPlus, Shield, User as UserIcon, Loader2, AlertCircle, Trash2 } from 'lucide-react';

const StaffManager: React.FC = () => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            // Fetch all Admins and Managers
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['ADMIN', 'MANAGER'])
                .order('role', { ascending: true });

            if (error) throw error;
            if (data) {
                setProfiles(data.map(p => ({
                    id: p.id,
                    name: p.name,
                    email: p.email,
                    role: p.role,
                    walletBalance: Number(p.wallet_balance),
                    loyaltyPoints: Number(p.loyalty_points)
                })));
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handlePromoteByEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;

        setIsProcessing('searching');
        setError(null);

        try {
            // Find user by email
            const { data: userToPromote, error: findError } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', searchQuery.trim())
                .single();

            if (findError) {
                if (findError.code === 'PGRST116') throw new Error('User not found. Ensure they have signed up first.');
                throw findError;
            }

            if (userToPromote.role !== 'USER') {
                throw new Error(`This user is already a ${userToPromote.role}`);
            }

            // Update role to MANAGER
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: 'MANAGER' })
                .eq('id', userToPromote.id);

            if (updateError) throw updateError;

            setSearchQuery('');
            alert(`${userToPromote.name} has been promoted to Manager!`);
            fetchStaff();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: UserRole) => {
        setIsProcessing(userId);
        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (updateError) throw updateError;
            fetchStaff();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <div className="p-6">
            <header className="mb-10">
                <h2 className="text-3xl font-serif text-white">Staff Management</h2>
                <p className="text-green-400/50">Manage roles for your kitchen and service team</p>
            </header>

            {/* Promotion Search */}
            <div className="bg-[#034435] p-6 rounded-3xl border border-green-800/30 mb-10">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <UserPlus size={20} className="text-amber-500" /> Promote New Manager
                </h3>
                <form onSubmit={handlePromoteByEmail} className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/40" size={18} />
                        <input
                            type="email"
                            placeholder="Enter user's registration email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#022c22] border border-green-800/30 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!!isProcessing}
                        className="bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
                    >
                        {isProcessing === 'searching' ? <Loader2 className="animate-spin" size={18} /> : 'Promote'}
                    </button>
                </form>
                {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
            </div>

            {/* Staff List */}
            <div className="space-y-4">
                <h3 className="text-green-100/50 text-sm font-bold uppercase tracking-widest pl-2">Current Staff Members</h3>
                {isLoading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>
                ) : profiles.length === 0 ? (
                    <div className="bg-[#034435] p-10 rounded-3xl text-center border border-dashed border-green-800/30 text-green-400/30">
                        No management staff found other than you.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profiles.map(profile => (
                            <div key={profile.id} className="bg-[#034435] p-4 rounded-2xl border border-green-800/30 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${profile.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {profile.role === 'ADMIN' ? <Shield size={24} /> : <ChefHat size={24} />}
                                    </div>
                                    <div>
                                        <div className="text-white font-bold flex items-center gap-2">
                                            {profile.name}
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter ${profile.role === 'ADMIN' ? 'bg-amber-500 text-[#022c22]' : 'bg-blue-500 text-white'}`}>
                                                {profile.role}
                                            </span>
                                        </div>
                                        <div className="text-green-400/40 text-xs">{profile.email}</div>
                                    </div>
                                </div>
                                {profile.role !== 'ADMIN' && (
                                    <button
                                        onClick={() => handleUpdateRole(profile.id, 'USER')}
                                        disabled={!!isProcessing}
                                        className="p-2 text-green-400/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Revoke Manager Access"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-8 p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10">
                <h4 className="text-amber-500 font-bold text-sm mb-2 flex items-center gap-2">
                    <AlertCircle size={16} /> Technical Note
                </h4>
                <p className="text-green-100/40 text-xs leading-relaxed">
                    Managers have full access to the Dashboard, Orders, and Dishes, but they cannot manage other staff members. Only Admins can promote/demote staff.
                </p>
            </div>
        </div>
    );
};

const ChefHat: React.FC<{ size?: number, className?: string }> = ({ size = 24, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M6 13.8V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10.8" />
        <path d="M6 18h12" />
        <path d="M6 22h12" />
        <path d="M17 22a5 5 0 0 0-10 0" />
    </svg>
);

export default StaffManager;
