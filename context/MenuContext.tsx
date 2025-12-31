import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { supabase } from '../lib/supabase';

interface MenuContextType {
    menu: MenuItem[];
    isLoading: boolean;
    addDish: (dish: Omit<MenuItem, 'id'>) => Promise<void>;
    updateDish: (id: string, updatedDish: Partial<MenuItem>) => Promise<void>;
    deleteDish: (id: string) => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMenu = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('dishes')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (data) {
                // Map snake_case from DB to camelCase for frontend
                const mappedMenu: MenuItem[] = data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    price: Number(item.price),
                    category: item.category,
                    isVeg: item.is_veg,
                    image: item.image,
                    rating: item.rating || 0,
                    reviewCount: item.review_count || 0
                }));
                setMenu(mappedMenu);
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();

        // Set up real-time menu subscription
        const subscription = supabase
            .channel('dishes-channel')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'dishes'
            }, (payload) => {
                console.log('Menu change detected:', payload);
                fetchMenu();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const addDish = async (dishData: Omit<MenuItem, 'id'>) => {
        try {
            const { error } = await supabase
                .from('dishes')
                .insert([{
                    name: dishData.name,
                    description: dishData.description,
                    price: dishData.price,
                    category: dishData.category,
                    is_veg: dishData.isVeg,
                    image: dishData.image
                }]);

            if (error) throw error;
            await fetchMenu();
        } catch (error) {
            console.error('Error adding dish:', error);
            alert('Failed to add dish');
        }
    };

    const updateDish = async (id: string, updatedDish: Partial<MenuItem>) => {
        try {
            const updatePayload: any = {};
            if (updatedDish.name !== undefined) updatePayload.name = updatedDish.name;
            if (updatedDish.description !== undefined) updatePayload.description = updatedDish.description;
            if (updatedDish.price !== undefined) updatePayload.price = updatedDish.price;
            if (updatedDish.category !== undefined) updatePayload.category = updatedDish.category;
            if (updatedDish.isVeg !== undefined) updatePayload.is_veg = updatedDish.isVeg;
            if (updatedDish.image !== undefined) updatePayload.image = updatedDish.image;

            const { error } = await supabase
                .from('dishes')
                .update(updatePayload)
                .eq('id', id);

            if (error) throw error;
            await fetchMenu();
        } catch (error) {
            console.error('Error updating dish:', error);
            alert('Failed to update dish');
        }
    };

    const deleteDish = async (id: string) => {
        try {
            const { error } = await supabase
                .from('dishes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchMenu();
        } catch (error) {
            console.error('Error deleting dish:', error);
            alert('Failed to delete dish');
        }
    };

    return (
        <MenuContext.Provider value={{ menu, isLoading, addDish, updateDish, deleteDish }}>
            {children}
        </MenuContext.Provider>
    );
};

export const useMenu = () => {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error('useMenu must be used within a MenuProvider');
    }
    return context;
};
