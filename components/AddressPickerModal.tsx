import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation, Search, X, Check, Loader2 } from 'lucide-react';
import L from 'leaflet';
import debounce from 'lodash.debounce';

// Fix for default Leaflet icon
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface AddressPickerModalProps {
    onClose: () => void;
    onSave: (address: { label: string, addressLine: string, lat: number, lng: number }) => void;
    initialLocation?: [number, number];
}

const AddressPickerModal: React.FC<AddressPickerModalProps> = ({ onClose, onSave, initialLocation }) => {
    const [position, setPosition] = useState<[number, number]>(initialLocation || [28.6139, 77.2090]); // Delhi default
    const [addressLine, setAddressLine] = useState('');
    const [label, setLabel] = useState('Home');
    const [isLocating, setIsLocating] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAddress = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
            );
            const data = await response.json();
            const fullAddress = `${data.locality || ''} ${data.city || ''} ${data.principalSubdivision || ''} ${data.postcode || ''}`.trim();
            setAddressLine(fullAddress || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        } catch (error) {
            setAddressLine(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        }
    };

    const debouncedFetchAddress = useCallback(
        debounce((lat: number, lng: number) => fetchAddress(lat, lng), 500),
        []
    );

    useEffect(() => {
        if (!initialLocation && "geolocation" in navigator) {
            handleLocateMe();
        } else if (initialLocation) {
            fetchAddress(initialLocation[0], initialLocation[1]);
        }
    }, []);

    const handleLocateMe = () => {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                setPosition(newPos);
                fetchAddress(newPos[0], newPos[1]);
                setIsLocating(false);
            },
            () => setIsLocating(false),
            { enableHighAccuracy: true }
        );
    };

    function LocationMarker() {
        const map = useMap();
        useMapEvents({
            click(e) {
                setPosition([e.latlng.lat, e.latlng.lng]);
                debouncedFetchAddress(e.latlng.lat, e.latlng.lng);
            },
        });

        useEffect(() => {
            map.flyTo(position, map.getZoom());
        }, [position, map]);

        return position === null ? null : (
            <Marker position={position} draggable={true} eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const newPos = marker.getLatLng();
                    setPosition([newPos.lat, newPos.lng]);
                    debouncedFetchAddress(newPos.lat, newPos.lng);
                }
            }} />
        );
    }

    function FixMap() {
        const map = useMap();
        useEffect(() => {
            setTimeout(() => {
                map.invalidateSize();
            }, 500);
        }, [map]);
        return null;
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const newPos: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                setPosition(newPos);
                setAddressLine(data[0].display_name);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-[#0F2E1A] border border-[#D4A017]/20 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="h-80 md:h-96 w-full relative z-0">
                    <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }} className="z-0">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <LocationMarker />
                        <FixMap />
                    </MapContainer>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-[1000] bg-white text-black p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <button
                        onClick={handleLocateMe}
                        className="absolute bottom-6 right-4 z-[1000] bg-[#D4A017] text-[#0F2E1A] p-3 rounded-full shadow-lg hover:bg-[#F4C430] transition-all active:scale-95"
                    >
                        {isLocating ? <Loader2 size={24} className="animate-spin" /> : <Navigation size={24} />}
                    </button>

                    <form
                        onSubmit={handleSearch}
                        className="absolute top-4 left-4 z-[1000] right-16 md:right-auto md:w-80"
                    >
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white text-black pl-10 pr-10 py-3 rounded-full shadow-xl focus:outline-none focus:ring-2 focus:ring-[#D4A017] text-sm"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4A017] animate-spin" size={18} />}
                        </div>
                    </form>
                </div>

                <div className="p-6 bg-[#0F2E1A]">
                    <div className="mb-6">
                        <label className="text-xs font-bold text-[#D4A017] uppercase tracking-widest mb-1 block">Address Label</label>
                        <div className="flex gap-2">
                            {['Home', 'Work', 'Other'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setLabel(t)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${label === t ? 'bg-[#D4A017] text-[#0F2E1A]' : 'bg-white/5 text-[#FAF7F0]/60 border border-[#D4A017]/20'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="text-xs font-bold text-[#D4A017] uppercase tracking-widest mb-1 block">Detailed Address</label>
                        <textarea
                            value={addressLine}
                            onChange={(e) => setAddressLine(e.target.value)}
                            className="w-full bg-white/5 border border-[#D4A017]/10 rounded-2xl p-4 text-[#FAF7F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 min-h-[80px]"
                            placeholder="Apartment, Street, Landmark..."
                        />
                    </div>

                    <button
                        onClick={() => onSave({ label, addressLine, lat: position[0], lng: position[1] })}
                        disabled={!addressLine}
                        className="w-full bg-[#D4A017] text-[#0F2E1A] font-bold py-4 rounded-2xl hover:bg-[#F4C430] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#D4A017]/20"
                    >
                        <Check size={20} /> Save Address
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressPickerModal;
