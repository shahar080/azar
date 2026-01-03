export function decodeExp(token: string): number | null {
    try {
        const b64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
        if (!b64) return null;
        const json = JSON.parse(atob(b64));
        return typeof json.exp === 'number' ? json.exp : null; // seconds since epoch
    } catch {
        return null;
    }
}

export function secondsUntilExpiry(token: string | null): number | null {
    if (!token) return null;
    const exp = decodeExp(token);
    if (exp == null) return null;
    return exp - Math.floor(Date.now() / 1000);
}