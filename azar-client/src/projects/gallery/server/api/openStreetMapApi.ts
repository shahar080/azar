export async function reverseGeocode(lat: number, lon: number): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const response = await fetch(url);
    // , {
    //     headers: {
    //         "User-Agent": "YourAppName/1.0 (your-email@example.com)"
    //     }
    // });
    if (!response.ok) {
        return "";
    }
    const data = await response.json();
    const address = data.address || {};
    const city = address.city || address.town || address.village || "";
    const country = address.country || "";
    return `${city}, ${country}`;
}