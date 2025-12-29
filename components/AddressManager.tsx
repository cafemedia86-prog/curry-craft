import React, { useState } from 'react';
import { Home, Briefcase, MapPin, Plus, Trash2, Check, Loader2, ChevronRight, Map as MapIcon } from 'lucide-react';
import { useAddresses, Address } from '../context/AddressContext';
import AddressPickerModal from './AddressPickerModal';

const AddressManager: React.FC = () => {
    const { addresses, isLoading, addAddress, deleteAddress, setDefaultAddress } = useAddresses();
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const getIcon = (label: string) => {
        switch (label.toLowerCase()) {
            case 'home': return <Home size={20} />;
            case 'work': return <Briefcase size={20} />;
            default: return <MapPin size={20} />;
        }
    };

    const handleSaveAddress = async (data: { label: string, addressLine: string, lat: number, lng: number }) => {
        try {
            await addAddress({
                label: data.label,
                addressLine: data.addressLine,
                latitude: data.lat,
                longitude: data.lng,
                isDefault: addresses.length === 0 // First address is default
            });
            setIsPickerOpen(false);
        } catch (error) {
            alert('Error saving address');
        }
    };

    if (isLoading && addresses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={32} className="text-amber-500 animate-spin mb-4" />
                <p className="text-green-400/60 font-medium">Fetching your addresses...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-serif text-white mb-1">Saved Addresses</h3>
                    <p className="text-green-400/40 text-xs">Manage your delivery locations</p>
                </div>
                <button
                    onClick={() => setIsPickerOpen(true)}
                    className="bg-amber-500/10 text-amber-500 p-3 rounded-2xl hover:bg-amber-500 hover:text-[#022c22] transition-all flex items-center gap-2 border border-amber-500/20"
                >
                    <Plus size={20} />
                    <span className="text-sm font-bold">Add New</span>
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="bg-[#034435] border border-green-800/30 rounded-3xl p-10 text-center">
                    <div className="w-20 h-20 bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-800/20">
                        <MapIcon className="text-green-700" size={32} />
                    </div>
                    <h4 className="text-white font-medium mb-2 text-lg">No addresses saved yet</h4>
                    <p className="text-green-400/40 text-sm mb-6 max-w-[200px] mx-auto">Add your first address to enjoy faster checkouts.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className={`bg-[#034435] border rounded-3xl p-5 hover:bg-[#045c48] transition-all group ${addr.isDefault ? 'border-amber-500/50' : 'border-green-800/30'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl ${addr.isDefault ? 'bg-amber-500 text-[#022c22]' : 'bg-green-900/40 text-amber-500'}`}>
                                    {getIcon(addr.label)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-white font-bold">{addr.label}</h4>
                                        {addr.isDefault && (
                                            <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-500/20">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-green-200/50 text-xs line-clamp-2 leading-relaxed mb-3">
                                        {addr.addressLine}
                                    </p>

                                    <div className="flex items-center gap-4">
                                        {!addr.isDefault && (
                                            <button
                                                onClick={() => setDefaultAddress(addr.id)}
                                                className="text-amber-500 text-[10px] font-bold uppercase tracking-widest hover:text-amber-400 transition-colors"
                                            >
                                                Set as Default
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteAddress(addr.id)}
                                            className="text-red-400/60 text-[10px] font-bold uppercase tracking-widest hover:text-red-400 transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="text-green-400/20 self-center group-hover:text-green-400/40 transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isPickerOpen && (
                <AddressPickerModal
                    onClose={() => setIsPickerOpen(false)}
                    onSave={handleSaveAddress}
                />
            )}
        </div>
    );
};

export default AddressManager;
