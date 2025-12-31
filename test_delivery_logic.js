
// Mock of the utility functions from utils/geoUtils.ts
const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

const calculateDeliveryFee = (distanceKm) => {
    if (distanceKm <= 3) return 50;
    if (distanceKm <= 6) return 80;
    if (distanceKm <= 10) return 120;
    if (distanceKm <= 15) return 150;
    return 200;
};

// --- Test Suite ---
console.log("--------------- Delivery Logic Test ---------------");

// 1. Test Pricing Tiers
const testCases = [
    { km: 1.5, expected: 50 },
    { km: 3.0, expected: 50 },
    { km: 3.1, expected: 80 },
    { km: 5.9, expected: 80 },
    { km: 6.0, expected: 80 },
    { km: 6.1, expected: 120 },
    { km: 9.9, expected: 120 },
    { km: 10.1, expected: 150 },
    { km: 15.0, expected: 150 },
    { km: 15.1, expected: 200 },
    { km: 25.0, expected: 200 }
];

console.log("\n1. Testing Fee Calculation Logic:");
let passes = 0;
testCases.forEach(t => {
    const fee = calculateDeliveryFee(t.km);
    const passed = fee === t.expected;
    if (passed) passes++;
    console.log(`   [${passed ? 'PASS' : 'FAIL'}] ${t.km} km -> Expected ₹${t.expected}, Got ₹${fee}`);
});

// 2. Test Distance Calculation
console.log("\n2. Testing Distance Calculation (Haversine):");
// Source: Curry Craft Main (28.5114747, 77.0740924)
// Target: Cyber City Gurgaon (approx 28.495, 77.089) - short distance
const lat1 = 28.5114747, lon1 = 77.0740924;
const lat2 = 28.4950000, lon2 = 77.0890000;

const dist = calculateDistance(lat1, lon1, lat2, lon2);
console.log(`   Outlet: (${lat1}, ${lon1})`);
console.log(`   Target: (${lat2}, ${lon2})`);
console.log(`   Calculated Distance: ${dist.toFixed(4)} km`);

// Verify realistic range (should be around 2-3km visually)
if (dist > 1 && dist < 3) {
    console.log("   [PASS] Distance seems reasonable (approx 2km).");
} else {
    console.log("   [WARN] Distance calculation might need verification.");
}

console.log(`\n---------------------------------------------------`);
console.log(`Tests Completed. ${passes}/${testCases.length} Fee Tests Passed.`);
