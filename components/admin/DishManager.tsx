import React, { useState } from 'react';
import { useMenu } from '../../context/MenuContext';
import { MenuItem } from '../../types';
import { Plus, Edit2, Trash2, X, Check, Search, Filter, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const DishManager: React.FC = () => {
    const { menu, addDish, updateDish, deleteDish } = useMenu();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState<Partial<MenuItem>>({
        name: '',
        description: '',
        price: 0,
        category: 'main-course',
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80'
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                .from('dish-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('dish-images')
                .getPublicUrl(filePath);

            setFormData({ ...formData, image: publicUrl });
        } catch (error: any) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (editingId) {
            await updateDish(editingId, formData);
            setEditingId(null);
        } else {
            await addDish(formData as Omit<MenuItem, 'id'>);
            setIsAdding(false);
        }
        setFormData({
            name: '',
            description: '',
            price: 0,
            category: 'main-course',
            isVeg: true,
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80'
        });
    };

    const startEdit = (dish: MenuItem) => {
        setFormData(dish);
        setEditingId(dish.id);
        setIsAdding(true);
    };

    const filteredMenu = menu.filter(dish =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-serif text-white">Menu Management</h2>
                    <p className="text-green-400/50">Manage your dishes and pricing</p>
                </div>

                <button
                    onClick={() => { setIsAdding(true); setEditingId(null); }}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg"
                >
                    <Plus size={20} /> Add New Dish
                </button>
            </header>

            <div className="mb-8 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/40" size={20} />
                <input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#034435] border border-green-800/30 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenu.map(dish => (
                    <div key={dish.id} className="bg-[#034435] rounded-3xl border border-green-800/30 overflow-hidden group">
                        <div className="h-48 relative overflow-hidden">
                            <img src={dish.image} alt={dish.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={() => startEdit(dish)}
                                    className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-amber-500 hover:text-green-950 transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => deleteDish(dish.id)}
                                    className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className={`absolute bottom-4 left-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${dish.isVeg ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                {dish.isVeg ? 'Veg' : 'Non-Veg'}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-white font-bold text-lg">{dish.name}</h3>
                                <span className="text-amber-500 font-bold">₹ {dish.price}</span>
                            </div>
                            <p className="text-green-400/60 text-sm line-clamp-2">{dish.description}</p>
                            <div className="mt-4 text-[10px] font-bold text-green-400/40 uppercase tracking-widest">{dish.category}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
                    <div className="relative w-full max-w-lg bg-[#022c22] border border-green-800/50 rounded-3xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-6 border-b border-green-800/30 flex justify-between items-center">
                            <h3 className="text-xl font-serif text-white">{editingId ? 'Edit Dish' : 'Add New Dish'}</h3>
                            <button onClick={() => setIsAdding(false)} className="text-green-400 hover:text-white"><X size={24} /></button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="text-xs font-bold text-green-400/60 uppercase tracking-wider block mb-2">Dish Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#034435] border border-green-800/30 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-green-400/60 uppercase tracking-wider block mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full bg-[#034435] border border-green-800/30 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-green-400/60 uppercase tracking-wider block mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-[#034435] border border-green-800/30 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="main-course">Main Course</option>
                                        <option value="paneer">Paneer</option>
                                        <option value="breads">Breads</option>
                                        <option value="rice">Rice</option>
                                        <option value="tandoori">Tandoori</option>
                                        <option value="drinks">Drinks</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-green-400/60 uppercase tracking-wider block mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-[#034435] border border-green-800/30 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-green-400/60 uppercase tracking-wider block mb-2">Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full bg-[#034435] border border-green-800/30 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                                    />
                                    <div className="w-12 h-12 bg-[#034435] rounded-xl flex items-center justify-center border border-green-800/30 overflow-hidden">
                                        {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-green-400/40" />}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-2">
                                <button
                                    onClick={() => setFormData({ ...formData, isVeg: !formData.isVeg })}
                                    className={`w-12 h-6 rounded-full transition-all relative ${formData.isVeg ? 'bg-green-600' : 'bg-red-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isVeg ? 'left-7' : 'left-1'}`} />
                                </button>
                                <span className="text-sm font-bold text-white uppercase">{formData.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                            </div>
                        </div>

                        <div className="p-6 border-t border-green-800/30 flex gap-4">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="flex-1 bg-green-900/50 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-amber-600 text-white font-bold py-3 rounded-xl hover:bg-amber-500 transition-all shadow-lg"
                            >
                                {editingId ? 'Update Dish' : 'Add Dish'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DishManager;
