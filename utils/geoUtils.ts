export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export const calculateDeliveryFee = (distanceKm: number): number => {
    if (distanceKm <= 3) return 50;
    if (distanceKm <= 6) return 80;
    if (distanceKm <= 10) return 120;
    if (distanceKm <= 15) return 150;
    // Fallback for very far distances (e.g. > 15km)
    // You might want to return a higher fee or indicate unavailable.
    // For now, let's cap it at 200 or return 150 as max.
    return 200;
};
