import React, { useState, useEffect } from 'react';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { MapPin, Save, Loader2, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const StoreSettings: React.FC = () => {
    const { settings, loading, updateSettings } = useStoreSettings();
    const [lat, setLat] = useState<number>(28.5114747);
    const [lng, setLng] = useState<number>(77.0740924);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (settings) {
            setLat(settings.outlet_latitude);
            setLng(settings.outlet_longitude);
        }
    }, [settings]);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        const result = await updateSettings(lat, lng);
        if (result.success) {
            setMessage({ type: 'success', text: 'Outlet location updated successfully!' });
        } else {
            setMessage({ type: 'error', text: 'Failed to update location.' });
        }
        setIsSaving(false);
    };

    function LocationMarker() {
        useMapEvents({
            click(e) {
                setLat(e.latlng.lat);
                setLng(e.latlng.lng);
            },
        });
        return <Marker position={[lat, lng]} />;
    }

    if (loading) return <div className="text-white p-6">Loading settings...</div>;

    return (
        <div className="p-6">
            <header className="mb-8">
                <h2 className="text-3xl font-serif text-white flex items-center gap-3">
                    <MapPin className="text-amber-500" /> Store Settings
                </h2>
                <p className="text-green-400/50">Configure your main outlet location for delivery calculations.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-[#034435] p-6 rounded-3xl border border-green-800/30">
                    <h3 className="text-xl text-white font-bold mb-6">Outlet Coordinates</h3>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="text-xs font-bold text-green-400/60 uppercase tracking-widest mb-1 block">Latitude</label>
                            <input
                                type="number"
                                value={lat}
                                onChange={(e) => setLat(parseFloat(e.target.value))}
                                className="w-full bg-green-900/20 text-white p-3 rounded-xl border border-green-800/30 font-mono"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-green-400/60 uppercase tracking-widest mb-1 block">Longitude</label>
                            <input
                                type="number"
                                value={lng}
                                onChange={(e) => setLng(parseFloat(e.target.value))}
                                className="w-full bg-green-900/20 text-white p-3 rounded-xl border border-green-800/30 font-mono"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Update Location
                    </button>

                    {message && (
                        <div className={`mt-4 p-3 rounded-xl text-sm font-bold text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {message.text}
                        </div>
                    )}
                </div>

                {/* Map Section */}
                <div className="bg-[#034435] p-1 rounded-3xl border border-green-800/30 overflow-hidden h-[400px] relative">
                    <MapContainer center={[lat, lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        <LocationMarker />
                    </MapContainer>
                    <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg text-xs font-bold shadow-lg z-[1000]">
                        Click map to set location
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-amber-500/10 p-6 rounded-3xl border border-amber-500/20">
                <h4 className="text-amber-400 font-bold mb-2">Delivery Charges Logic</h4>
                <ul className="text-green-100/60 text-sm space-y-1 list-disc pl-5">
                    <li>0 - 3 km: ₹50</li>
                    <li>3 - 6 km: ₹80</li>
                    <li>6 - 10 km: ₹120</li>
                    <li>10 - 15 km: ₹150</li>
                    <li>&gt; 15 km: ₹200 (Flat)</li>
                </ul>
            </div>
        </div>
    );
};

export default StoreSettings;
