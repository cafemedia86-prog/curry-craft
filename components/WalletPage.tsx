import React from 'react';
import { Wallet, CreditCard, Plus, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const WalletPage = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="p-5 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-serif text-white mb-6">My Royal Wallet</h2>
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-[2rem] p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                <div className="relative z-10">
                    <span className="text-amber-100/70 text-xs font-bold uppercase tracking-widest">Available Balance</span>
                    <div className="text-5xl font-bold mt-2 mb-6">₹ {user.walletBalance.toLocaleString('en-IN')}</div>
                    <div className="flex gap-3">
                        <button className="bg-white text-amber-700 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95">
                            <Plus size={18} /> Add Money
                        </button>
                        <button className="bg-amber-800/30 border border-amber-400/20 px-6 py-2.5 rounded-xl text-sm font-bold backdrop-blur-sm flex items-center gap-2 transition-colors hover:bg-amber-800/40">
                            <Clock size={18} /> History
                        </button>
                    </div>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] opacity-10 transform rotate-12">
                    <Wallet size={180} />
                </div>
            </div>

            <h3 className="text-green-950 font-bold mb-4 px-1">Payment Methods</h3>
            <div className="space-y-4 mb-8">
                <div className="bg-[#034435] p-5 rounded-2xl flex items-center gap-4 border border-green-800/30 hover:border-green-700/50 transition-colors">
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                        <CreditCard className="text-amber-500" size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="text-white font-bold">Primary Card</div>
                        <div className="text-green-400/50 text-xs">Visa ending in •••• 4582</div>
                    </div>
                    <span className="text-amber-500/40 text-[10px] uppercase font-bold tracking-widest">Active</span>
                </div>

                <button className="w-full py-4 border-2 border-dashed border-green-800/30 rounded-2xl text-green-400/40 text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-900/20 transition-all">
                    <Plus size={18} /> Add New Method
                </button>
            </div>

            <h3 className="text-green-950 font-bold mb-4 px-1">Recent Transactions</h3>
            <TransactionList />
        </div>
    );
};

const TransactionList = () => {
    const [transactions, setTransactions] = React.useState<any[]>([]);
    const { user } = useAuth();
    const [loading, setLoading] = React.useState(true);


    React.useEffect(() => {
        if (user) {
            const fetchTransactions = async () => {
                const { data } = await supabase
                    .from('wallet_transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (data) setTransactions(data);
                setLoading(false);
            };
            fetchTransactions();
        }
    }, [user]);

    if (loading) return <div className="text-green-400/50 text-sm p-4">Loading history...</div>;

    if (transactions.length === 0) return <div className="text-green-400/50 text-sm p-4 text-center border border-dashed border-green-800/30 rounded-xl">No transactions yet</div>;

    return (
        <div className="space-y-3">
            {transactions.map(tx => (
                <div key={tx.id} className="bg-[#034435] p-4 rounded-xl border border-green-800/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                            {tx.amount > 0 ? <Plus size={14} /> : <CreditCard size={14} />}
                        </div>
                        <div>
                            <div className="text-white font-medium text-sm">{tx.description}</div>
                            <div className="text-green-400/40 text-xs">{new Date(tx.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-white'}`}>
                        {tx.amount > 0 ? '+' : ''}₹ {Math.abs(tx.amount)}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WalletPage;
