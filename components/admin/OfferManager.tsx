import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit2, X, Image as ImageIcon, Percent, Hash, Calendar } from 'lucide-react';

interface Offer {
    id: string;
    code: string;
    title: string;
    subtitle: string;
    discount_type: 'PERCENTAGE' | 'FIXED';
    discount_value: number;
    min_order_value: number;
    valid_until: string | null;
    is_active: boolean;
    image_url: string;
}

const OfferManager = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        subtitle: '',
        discount_type: 'PERCENTAGE',
        discount_value: '',
        min_order_value: '0',
        valid_until: '',
        image_url: '',
        is_active: true
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Try to upload to 'offer-images' first
            const { error: uploadError, data } = await supabase.storage
                .from('offer-images')
                .upload(filePath, file);

            if (uploadError) {
                // If bucket not found or other error, try fallback or just throw
                console.error('Upload failed', uploadError);
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('offer-images')
                .getPublicUrl(filePath);

            setFormData({ ...formData, image_url: publicUrl });
        } catch (error: any) {
            alert('Error uploading image: ' + error.message + '. Ensure "offer-images" bucket exists and is public.');
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('offers')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setOffers(data);
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const offerData = {
            ...formData,
            code: formData.code.toUpperCase(),
            discount_value: Number(formData.discount_value),
            min_order_value: Number(formData.min_order_value),
            valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null
        };

        let error;
        if (editingOffer) {
            const { error: updatedError } = await supabase
                .from('offers')
                .update(offerData)
                .eq('id', editingOffer.id);
            error = updatedError;
        } else {
            const { error: insertError } = await supabase
                .from('offers')
                .insert([offerData]);
            error = insertError;
        }

        if (!error) {
            setIsModalOpen(false);
            setEditingOffer(null);
            resetForm();
            fetchOffers();
        } else {
            alert('Error saving offer: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this offer?')) return;
        const { error } = await supabase.from('offers').delete().eq('id', id);
        if (!error) fetchOffers();
    };

    const openEdit = (offer: Offer) => {
        setEditingOffer(offer);
        setFormData({
            code: offer.code,
            title: offer.title,
            subtitle: offer.subtitle || '',
            discount_type: offer.discount_type,
            discount_value: String(offer.discount_value),
            min_order_value: String(offer.min_order_value),
            valid_until: offer.valid_until ? offer.valid_until.split('T')[0] : '',
            image_url: offer.image_url || '',
            is_active: offer.is_active
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            code: '',
            title: '',
            subtitle: '',
            discount_type: 'PERCENTAGE',
            discount_value: '',
            min_order_value: '0',
            valid_until: '',
            image_url: '',
            is_active: true
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif text-green-950">Manage Offers</h2>
                <button
                    onClick={() => { resetForm(); setEditingOffer(null); setIsModalOpen(true); }}
                    className="bg-amber-500 hover:bg-amber-600 text-[#022c22] px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} /> Create Offer
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-stone-500">Loading offers...</div>
            ) : offers.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-stone-300 rounded-xl text-stone-500">
                    No active offers found. Create one to get started!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map(offer => (
                        <div key={offer.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                            <div className="h-40 bg-stone-100 relative overflow-hidden">
                                {offer.image_url ? (
                                    <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold ${offer.is_active ? 'bg-green-500 text-white' : 'bg-stone-500 text-white'}`}>
                                    {offer.is_active ? 'ACTIVE' : 'INACTIVE'}
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-green-950 line-clamp-1">{offer.title}</h3>
                                    <span className="font-mono text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded border border-amber-200">{offer.code}</span>
                                </div>
                                <p className="text-sm text-stone-500 mb-4 line-clamp-2">{offer.subtitle}</p>

                                <div className="flex items-center gap-4 text-sm text-stone-600 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Percent size={14} />
                                        <span>{offer.discount_type === 'PERCENTAGE' ? `${offer.discount_value}%` : `₹${offer.discount_value}`} OFF</span>
                                    </div>
                                    {offer.min_order_value > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Hash size={14} />
                                            <span>Min ₹{offer.min_order_value}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => openEdit(offer)}
                                        className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(offer.id)}
                                        className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-green-950">
                                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 mb-1">Coupon Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 font-mono uppercase text-stone-950"
                                        placeholder="SAVE20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 mb-1">Discount Type</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={e => setFormData({ ...formData, discount_type: e.target.value as any })}
                                        className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 text-stone-950"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Title (Banner Heading)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 text-stone-950"
                                    placeholder="e.g. Biryani Bonanza"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Subtitle (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 text-stone-950"
                                    placeholder="e.g. Valid on all chicken biryanis"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 mb-1">Discount Value</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.discount_value}
                                        onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                        className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 text-stone-950"
                                        placeholder={formData.discount_type === 'PERCENTAGE' ? '20' : '100'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 mb-1">Min Order Value</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.min_order_value}
                                        onChange={e => setFormData({ ...formData, min_order_value: e.target.value })}
                                        className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 text-stone-950"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Image</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={formData.image_url}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        className="flex-1 p-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 text-stone-950"
                                        placeholder="https://... or upload image"
                                    />
                                    <label className="cursor-pointer bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                                        {isUploading ? 'Uploading...' : 'Upload'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                        />
                                    </label>
                                </div>
                                {isUploading && <p className="text-xs text-amber-500 mt-1">Uploading image to Supabase...</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Valid Until (Optional)</label>
                                <input
                                    type="date"
                                    value={formData.valid_until}
                                    onChange={e => setFormData({ ...formData, valid_until: e.target.value })}
                                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 text-stone-950"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 accent-amber-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-green-950">Active</label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-amber-500 text-[#022c22] py-4 rounded-xl font-bold text-lg hover:bg-amber-600 transition-colors shadow-lg"
                            >
                                {editingOffer ? 'Update Offer' : 'Create Offer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfferManager;
