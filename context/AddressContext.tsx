import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Address {
    id: string;
    userId: string;
    label: string;
    addressLine: string;
    latitude: number;
    longitude: number;
    isDefault: boolean;
}

interface AddressContextType {
    addresses: Address[];
    isLoading: boolean;
    addAddress: (address: Omit<Address, 'id' | 'userId'>) => Promise<void>;
    updateAddress: (id: string, updatedAddress: Partial<Address>) => Promise<void>;
    deleteAddress: (id: string) => Promise<void>;
    setDefaultAddress: (id: string) => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAddresses = async () => {
        if (!user) {
            setAddresses([]);
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mappedAddresses: Address[] = data.map((item: any) => ({
                    id: item.id,
                    userId: item.user_id,
                    label: item.label,
                    addressLine: item.address_line,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    isDefault: item.is_default
                }));
                setAddresses(mappedAddresses);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [user]);

    const addAddress = async (addressData: Omit<Address, 'id' | 'userId'>) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('addresses')
                .insert([{
                    user_id: user.id,
                    label: addressData.label,
                    address_line: addressData.addressLine,
                    latitude: addressData.latitude,
                    longitude: addressData.longitude,
                    is_default: addressData.isDefault
                }]);

            if (error) throw error;
            await fetchAddresses();
        } catch (error) {
            console.error('Error adding address:', error);
            throw error;
        }
    };

    const updateAddress = async (id: string, updatedAddress: Partial<Address>) => {
        try {
            const updatePayload: any = {};
            if (updatedAddress.label !== undefined) updatePayload.label = updatedAddress.label;
            if (updatedAddress.addressLine !== undefined) updatePayload.address_line = updatedAddress.addressLine;
            if (updatedAddress.latitude !== undefined) updatePayload.latitude = updatedAddress.latitude;
            if (updatedAddress.longitude !== undefined) updatePayload.longitude = updatedAddress.longitude;
            if (updatedAddress.isDefault !== undefined) updatePayload.is_default = updatedAddress.isDefault;

            const { error } = await supabase
                .from('addresses')
                .update(updatePayload)
                .eq('id', id);

            if (error) throw error;
            await fetchAddresses();
        } catch (error) {
            console.error('Error updating address:', error);
            throw error;
        }
    };

    const deleteAddress = async (id: string) => {
        try {
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            throw error;
        }
    };

    const setDefaultAddress = async (id: string) => {
        if (!user) return;
        setIsLoading(true);
        try {
            // Unset current default for THIS user
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id);

            // Set new default
            const { error } = await supabase
                .from('addresses')
                .update({ is_default: true })
                .eq('id', id);

            if (error) throw error;
            await fetchAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AddressContext.Provider value={{
            addresses,
            isLoading,
            addAddress,
            updateAddress,
            deleteAddress,
            setDefaultAddress
        }}>
            {children}
        </AddressContext.Provider>
    );
};

export const useAddresses = () => {
    const context = useContext(AddressContext);
    if (context === undefined) {
        throw new Error('useAddresses must be used within an AddressProvider');
    }
    return context;
};
