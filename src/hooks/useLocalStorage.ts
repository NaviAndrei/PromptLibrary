import { useState, useEffect } from 'react';

// Generic hook to store and read data from localStorage
// Uses "lazy" initialization so JSON parsing only happens on the first render
export function useLocalStorage<T>(key: string, initialValue: T) {
    // Define the state that automatically reads based on the key from localStorage
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            // If the value exists, parse it; otherwise use the default initial value
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            // Graceful fallback in case of invalid storage or corrupt JSON
            return initialValue;
        }
    });

    // Listen for external changes to localStorage (e.g., imports from DataActions)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key || e.key === null) {
                try {
                    const item = window.localStorage.getItem(key);
                    const newValue = item ? JSON.parse(item) : initialValue;
                    setStoredValue(newValue);
                    console.log(`Storage sync triggered for key: ${key}`, newValue?.length);
                } catch (err) {
                    console.error('Error during auto-sync:', err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        // Also listen for custom events dispatched manually via dispatchEvent(new Event('storage'))
        const handleCustomStorage = () => handleStorageChange({ key } as StorageEvent);
        window.addEventListener('storage-sync', handleCustomStorage);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('storage-sync', handleCustomStorage);
        };
    }, [key, initialValue]);

    // This function wraps the standard React setter to also persist to localStorage simultaneously
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Allow the value to be a function (just like useState natively supports)
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            
            // 1. Update the React state
            setStoredValue(valueToStore);
            
            // 2. Save it as a string to localStorage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    };

    // Return in the same array format as useState
    return [storedValue, setValue] as const;
}
