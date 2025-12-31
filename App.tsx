import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SpecialOffers from './components/SpecialOffers';
import Menu from './components/Menu';
import BottomNav from './components/BottomNav';
import ProductModal from './components/ProductModal';
import CartSidebar from './components/CartSidebar';
import { CartProvider } from './context/CartContext';
import { MenuItem, DishFilter } from './types';
import WalletPage from './components/WalletPage';
import ProfilePage from './components/ProfilePage';
import { Home, ShoppingBag, User, Wallet, ClipboardList, ChefHat, Award, TrendingUp, Users, Ticket, LogOut, Settings } from 'lucide-react';
import CheckoutPage from './components/CheckoutPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MenuProvider } from './context/MenuContext';
import { OrderProvider, useOrders } from './context/OrderContext';
import { AddressProvider } from './context/AddressContext';
import { LoyaltyProvider } from './context/LoyaltyContext';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/admin/AdminDashboard';
import FilterModal from './components/FilterModal';

// --- Main App Component ---

function AppContent() {
    const { user, isLoading } = useAuth();
    const { placeOrder } = useOrders();
    const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
    const [currentTab, setCurrentTab] = useState('home');
    const [adminSubTab, setAdminSubTab] = useState<'home' | 'orders' | 'dishes' | 'loyalty' | 'staff' | 'analytics' | 'offers'>('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [afterAuthRedirect, setAfterAuthRedirect] = useState<{ tab: string, subTab?: string } | null>(null);
    const [dishFilters, setDishFilters] = useState<DishFilter>({
        type: 'all',
        sortBy: 'popularity'
    });

    // Logout Redirection
    React.useEffect(() => {
        if (!user && (currentTab === 'admin' || currentTab === 'checkout' || currentTab === 'wallet' || currentTab === 'profile')) {
            setCurrentTab('home');
        }
    }, [user, currentTab]);

    React.useEffect(() => {
        const handleSwitchTab = (e: any) => {
            const tab = e.detail;
            // Protected tabs that require login
            const protectedTabs = ['checkout', 'wallet', 'profile', 'admin'];
            if (protectedTabs.includes(tab) && !user) {
                setAfterAuthRedirect({ tab });
                setIsAuthModalOpen(true);
                return;
            }

            if ((user?.role === 'ADMIN' || user?.role === 'MANAGER') && !['checkout', 'profile', 'home', 'explore', 'wallet'].includes(tab)) {
                setAdminSubTab(tab);
                setCurrentTab('admin');
            } else {
                setCurrentTab(tab);
            }
        };
        window.addEventListener('switchTab', handleSwitchTab);
        return () => window.removeEventListener('switchTab', handleSwitchTab);
    }, [user]);

    // Handle tab switching
    const handleTabChange = (tab: string) => {
        // Protected tabs that require login
        const protectedTabs = ['checkout', 'wallet', 'profile', 'admin'];
        if (protectedTabs.includes(tab) && !user) {
            setAfterAuthRedirect({ tab });
            setIsAuthModalOpen(true);
            return;
        }

        if (tab === 'profile') {
            setCurrentTab('profile');
        } else if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
            setAdminSubTab(tab);
            setCurrentTab('admin');
        } else {
            setCurrentTab(tab);
        }

        if (tab !== 'home' && tab !== 'explore') {
            setSearchQuery('');
        }
    };

    // Auto-redirect after login
    React.useEffect(() => {
        if (user && afterAuthRedirect) {
            handleTabChange(afterAuthRedirect.tab);
            setAfterAuthRedirect(null);
        }
    }, [user, afterAuthRedirect, handleTabChange]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#022c22] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    // Simplified: Don't block the whole app if !user

    const renderContent = () => {
        if (!user) {
            switch (currentTab) {
                case 'home':
                    return (
                        <>
                            {!searchQuery && <SpecialOffers />}
                            <Menu
                                onProductClick={setSelectedProduct}
                                searchQuery={searchQuery}
                                filters={dishFilters}
                            />
                        </>
                    );
                case 'explore':
                    return (
                        <div className="pt-4">
                            <h2 className="text-2xl font-serif text-[#0F2E1A] px-5 mb-4">Explore Menu</h2>
                            <Menu
                                onProductClick={setSelectedProduct}
                                searchQuery={searchQuery}
                                filters={dishFilters}
                            />
                        </div>
                    );
                default:
                    return (
                        <>
                            {!searchQuery && <SpecialOffers />}
                            <Menu
                                onProductClick={setSelectedProduct}
                                searchQuery={searchQuery}
                                filters={dishFilters}
                            />
                        </>
                    );
            }
        }

        if (user.role === 'ADMIN' || user.role === 'MANAGER') {
            if (currentTab === 'profile') return <ProfilePage />;
            return <AdminDashboard activeSubTab={adminSubTab} />;
        }

        switch (currentTab) {
            case 'home':
                return (
                    <>
                        {!searchQuery && <SpecialOffers />}
                        <Menu
                            onProductClick={setSelectedProduct}
                            searchQuery={searchQuery}
                            filters={dishFilters}
                        />
                    </>
                );
            case 'checkout':
                return (
                    <CheckoutPage
                        onBack={() => setCurrentTab('home')}
                        onOrderPlaced={async (orderData) => {
                            await placeOrder(orderData);
                            // Success state is handled inside CheckoutPage before this returns
                            setTimeout(() => {
                                setCurrentTab('home');
                            }, 2500);
                        }}
                    />
                );
            case 'explore':
                return (
                    <div className="pt-4">
                        <h2 className="text-2xl font-serif text-[#0F2E1A] px-5 mb-4">Explore Menu</h2>
                        <Menu
                            onProductClick={setSelectedProduct}
                            searchQuery={searchQuery}
                            filters={dishFilters}
                        />
                    </div>
                );
            case 'wallet':
                return <WalletPage />;
            case 'profile':
                return <ProfilePage />;
            default:
                return <Menu onProductClick={setSelectedProduct} searchQuery={searchQuery} filters={dishFilters} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F1E8] text-[#0F2E1A] font-sans selection:bg-[#D4A017] selection:text-white pb-24">
            <Navbar
                onSearch={setSearchQuery}
                searchTerm={searchQuery}
                onFilterClick={() => setIsFilterModalOpen(true)}
            />
            <main className="pt-2">
                {renderContent()}
            </main>
            <BottomNav
                activeTab={currentTab === 'profile' ? 'profile' : ((user?.role === 'ADMIN' || user?.role === 'MANAGER') ? adminSubTab : currentTab)}
                onTabChange={handleTabChange}
                isAdmin={user?.role === 'ADMIN' || user?.role === 'MANAGER'}
            />
            {!(user?.role === 'ADMIN' || user?.role === 'MANAGER') && <CartSidebar />}
            {isAuthModalOpen && (
                <LoginModal
                    onClose={() => {
                        setIsAuthModalOpen(false);
                        // If we had a redirect queued, and now we have a user, go there
                        if (afterAuthRedirect) {
                            // We don't need to manually trigger because the user state update 
                            // will re-render, but if they logged in successfully,
                            // we can try to apply it now if handleTabChange is called.
                            setAfterAuthRedirect(null);
                        }
                    }}
                />
            )}
            {selectedProduct && (
                <ProductModal
                    item={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                filters={dishFilters}
                onApply={setDishFilters}
            />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <MenuProvider>
                <LoyaltyProvider>
                    <OrderProvider>
                        <CartProvider>
                            <AddressProvider>
                                <AppContent />
                            </AddressProvider>
                        </CartProvider>
                    </OrderProvider>
                </LoyaltyProvider>
            </MenuProvider>
        </AuthProvider>
    );
}

export default App;