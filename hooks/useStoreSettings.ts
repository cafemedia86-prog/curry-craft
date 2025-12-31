import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface StoreSettings {
    id: number;
    outlet_name: string;
    outlet_latitude: number;
    outlet_longitude: number;
}

export const useStoreSettings = () => {
    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('store_settings')
                .select('*')
                .single(); // Assuming single row

            if (error) {
                // If table is empty or error, use defaults (though SQL script inserts row)
                if (error.code === 'PGRST116') { // JSON object requested, multiple (or no) rows returned
                    // Handle empty case if needed, but we expect 1 row
                }
                console.error('Error fetching settings:', error);
            } else {
                setSettings(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (lat: number, lng: number) => {
        try {
            // Upsert based on known ID usually, or just update the single row
            // If we don't know ID, we might assume ID=1 or fetch first.
            const { error } = await supabase
                .from('store_settings')
                .update({ outlet_latitude: lat, outlet_longitude: lng })
                .gt('id', 0); // Update any row (conceptually singleton)

            if (error) throw error;
            await fetchSettings();
            return { success: true };
        } catch (error) {
            console.error('Error updating settings:', error);
            return { success: false, error };
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return { settings, loading, updateSettings, refetch: fetchSettings };
};
