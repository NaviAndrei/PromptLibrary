import { useState, useEffect } from 'react';
import { dbInstance } from '../utils/db';
import { toast } from 'sonner';

/**
 * Enhanced hook to replace useLocalStorage with IndexedDB for large data sets.
 * Automatically performs a "One-Time Migration" from localStorage if it finds existing data.
 */
export function useIndexedDB<T>(storeName: string, initialValue: T[]) {
    const [storedValue, setStoredValue] = useState<T[]>(initialValue);

    // Load data from IndexedDB on component mount
    useEffect(() => {
        const loadAndMigrate = async () => {
            try {
                // 1. Try to load existing data from IndexedDB
                const data = await dbInstance.getAll<T>(storeName);
                
                if (data.length > 0) {
                    setStoredValue(data);
                    console.log(`[DB] Loaded ${data.length} items from ${storeName}`);
                } else {
                    // 2. One-Time Migration: Check if there's old data in localStorage
                    const legacyData = window.localStorage.getItem(storeName);
                    if (legacyData) {
                        const parsed: T[] = JSON.parse(legacyData);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            console.log(`[DB] Migrating ${parsed.length} items from localStorage to IndexedDB...`);
                            
                            // Batch migrate into IndexedDB
                            for (const item of parsed) {
                                await dbInstance.put(storeName, item);
                            }
                            
                            setStoredValue(parsed);
                            toast.success(`Migration completed! ${parsed.length} items moved to high-performance storage.`);
                            
                            // Optional: Clear legacy data to prevent duplicate migration attempts
                            // window.localStorage.removeItem(storeName);
                        }
                    }
                }
            } catch (error) {
                console.error(`[DB] Error loading ${storeName}:`, error);
                toast.error(`Database error while loading ${storeName}. Check your browser console.`);
            }
        };

        loadAndMigrate();
    }, [storeName]);

    /**
     * Specialized "Save" function that handles IndexedDB persistence
     */
    const setValue = async (value: T[] | ((val: T[]) => T[])) => {
        try {
            const nextValue = value instanceof Function ? value(storedValue) : value;
            
            // 1. Update In-Memory React State (fast UI feedback)
            setStoredValue(nextValue);
            
            // 2. Perform Batch-Update or Clear-and-Replace in IDB (persistence)
            await dbInstance.clear(storeName);
            for (const item of nextValue) {
                await dbInstance.put(storeName, item);
            }
            
            // 3. Dispatch global sync event for other components (including StorageUsage)
            window.dispatchEvent(new Event('storage-sync'));
            
        } catch (error) {
            console.error(`[DB] Error saving to ${storeName}:`, error);
            toast.error(`Failed to persist ${storeName} to database.`);
        }
    };

    return [storedValue, setValue] as const;
}
