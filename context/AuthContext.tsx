import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export type UserRole = 'USER' | 'ADMIN' | 'MANAGER';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    walletBalance: number;
    loyaltyPoints: number;
}

interface AuthContextType {
    user: UserProfile | null;
    sbUser: User | null;
    login: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, name: string, phone: string, role: UserRole) => Promise<{ error: any }>;
    logout: () => Promise<void>;
    updateWallet: (amount: number) => Promise<void>;
    addLoyaltyPoints: (points: number) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [sbUser, setSbUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSbUser(session.user);
                fetchProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setSbUser(session.user);
                fetchProfile(session.user.id);
            } else {
                setSbUser(null);
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setUser({
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    walletBalance: Number(data.wallet_balance || 0),
                    loyaltyPoints: Number(data.loyalty_points || 0)
                });
            } else if (error && error.code === 'PGRST116') {
                console.log('No profile found for user');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUp = async (email: string, password: string, name: string, phone: string, role: UserRole) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    phone: phone,
                    role: role
                }
            }
        });

        // NOTE: Profile creation is now handled by a Supabase Database Trigger 
        // linked to the auth.users table for reliability.

        return { error };
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const updateWallet = async (amount: number) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('wallet_transactions')
                .insert([{
                    user_id: user.id,
                    amount: amount,
                    type: amount > 0 ? 'credit' : 'debit',
                    description: amount > 0 ? 'Wallet Top-up' : 'Order Payment'
                }]);

            if (error) throw error;

            // Optimistic update or fetch new profile
            const newBalance = user.walletBalance + amount;
            setUser({ ...user, walletBalance: newBalance });
        } catch (error) {
            console.error('Error updating wallet:', error);
            throw error;
        }
    };

    const addLoyaltyPoints = async (points: number) => {
        if (!user) return;
        const newPoints = user.loyaltyPoints + points;
        const { error } = await supabase
            .from('profiles')
            .update({ loyalty_points: newPoints })
            .eq('id', user.id);

        if (!error) {
            setUser({ ...user, loyaltyPoints: newPoints });
        } else {
            console.error('Error updating loyalty points:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, sbUser, login, signUp, logout, updateWallet, addLoyaltyPoints, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
