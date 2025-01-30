class LocalStorageManager {
    static setItem<T>(key: string, value: T) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static getItem<T>(key: string): T | null {
        const item = localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : null;
    }

    static getItemWithDefault<T>(key: string, defaultValue: T): T {
        const item: T | null = this.getItem(key);
        return item ? item : defaultValue;
    }

    static removeItem(key: string) {
        localStorage.removeItem(key);
    }

    static clear() {
        localStorage.clear();
    }

    static exists(key: string): boolean {
        return localStorage.getItem(key) !== null;
    }
}

export default LocalStorageManager;
