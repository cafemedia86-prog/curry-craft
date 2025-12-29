import React, { useState, useEffect } from 'react';
import { Award, Star, TrendingUp, Settings, Plus, Trash2, Edit2, ShieldAlert } from 'lucide-react';

interface LoyaltyConfig {
    pointsPerRupee: number;
    minimumRedemption: number;
    tiers: { name: string, minPoints: number, multiplier: number }[];
}

const LoyaltyManager: React.FC = () => {
    const [config, setConfig] = useState<LoyaltyConfig>({
        pointsPerRupee: 0.1, // 1 point per 10 rupees
        minimumRedemption: 100,
        tiers: [
            { name: 'Bronze', minPoints: 0, multiplier: 1 },
            { name: 'Silver', minPoints: 500, multiplier: 1.1 },
            { name: 'Gold', minPoints: 2000, multiplier: 1.25 }
        ]
    });

    useEffect(() => {
        const savedConfig = localStorage.getItem('curry_craft_loyalty_config');
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
        }
    }, []);

    const saveConfig = (newConfig: LoyaltyConfig) => {
        setConfig(newConfig);
        localStorage.setItem('curry_craft_loyalty_config', JSON.stringify(newConfig));
    };

    return (
        <div className="p-6">
            <header className="mb-10">
                <h2 className="text-3xl font-serif text-white">Loyalty Program</h2>
                <p className="text-green-400/50">Design and configure rewards for your regular patrons</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Basic Configuration */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-[#034435] p-8 rounded-3xl border border-green-800/30">
                        <div className="flex items-center gap-3 mb-6">
                            <Settings className="text-amber-500" size={24} />
                            <h3 className="text-xl font-serif text-white">Earning Rules</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-green-400/60 uppercase tracking-wider block mb-3">Points Multiplier (Points per Rupee)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0.01"
                                        max="1.0"
                                        step="0.01"
                                        value={config.pointsPerRupee}
                                        onChange={(e) => saveConfig({ ...config, pointsPerRupee: parseFloat(e.target.value) })}
                                        className="flex-1 accent-amber-500"
                                    />
                                    <span className="w-16 text-center bg-green-900 py-1 rounded-lg text-amber-400 font-bold">{config.pointsPerRupee}</span>
                                </div>
                                <p className="text-[11px] text-green-400/40 mt-2 italic">* A setting of 0.1 means 1 point for every ₹10 spent.</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-green-400/60 uppercase tracking-wider block mb-3">Minimum points for Redemption</label>
                                <input
                                    type="number"
                                    value={config.minimumRedemption}
                                    onChange={(e) => saveConfig({ ...config, minimumRedemption: parseInt(e.target.value) })}
                                    className="w-full bg-green-900 border border-green-800/30 rounded-xl p-4 text-white focus:outline-none focus:border-amber-500 transition-all font-bold"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-[#034435] p-8 rounded-3xl border border-green-800/30">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <Star className="text-amber-500" size={24} />
                                <h3 className="text-xl font-serif text-white">Membership Tiers</h3>
                            </div>
                            <button className="text-amber-500 border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-white transition-all">
                                <Plus size={16} className="inline mr-1" /> Add Tier
                            </button>
                        </div>

                        <div className="space-y-4">
                            {config.tiers.map((tier, i) => (
                                <div key={i} className="bg-green-900/40 p-5 rounded-2xl border border-green-800/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="text-white font-bold">{tier.name}</div>
                                        <div className="text-green-400/50 text-[10px] uppercase tracking-widest">{tier.minPoints}+ Points required</div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-amber-500 font-bold">{tier.multiplier}x</div>
                                            <div className="text-green-400/40 text-[9px] uppercase tracking-widest">Multiplier</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 text-green-400/60 hover:text-white"><Edit2 size={16} /></button>
                                            <button className="p-2 text-red-500/60 hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Integration Info */}
                <div className="space-y-6">
                    <div className="bg-amber-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <Award size={100} className="absolute -right-4 -bottom-4 opacity-20" />
                        <h3 className="text-lg font-serif mb-4 relative z-10">Admin Tip</h3>
                        <p className="text-sm leading-relaxed opacity-90 relative z-10">
                            Higher multipliers for Silver and Gold tiers encourage customers to order more frequently.
                            Consider setting a holiday special with 2x points to boost sales!
                        </p>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <ShieldAlert size={20} />
                            <h4 className="font-bold">Important</h4>
                        </div>
                        <p className="text-xs text-red-500/70 leading-relaxed">
                            Points rules are applied at the time of order placement. Changing rules now will not affect points already earned by customers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyManager;
