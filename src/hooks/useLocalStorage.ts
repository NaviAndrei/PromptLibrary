import { useState } from 'react';

// Hook generic pentru a stoca și citi date din localStorage
// Utilizează inițializare "leneșă" (lazy initialization) pentru ca parsarea JSON să se facă doar la prima randare
export function useLocalStorage<T>(key: string, initialValue: T) {
    // Definirea state-ului care citește automat pe baza cheii din localStorage
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            // Dacă valoarea există, o parsăm; altfel folosim valoarea inițială default
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Eroare la citirea din localStorage:', error);
            // Fallback grațios în caz de memorie invalidă sau JSON corupt
            return initialValue;
        }
    });

    // Această funcție o prinde pe cea standard din React pentru a salva în localStorage simultan
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Permitem ca valoarea să fie o funcție (exact cum permite useState nativ)
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            
            // 1. O adăugăm în state-ul React
            setStoredValue(valueToStore);
            
            // 2. O salvăm ca string în localStorage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error('Eroare la salvarea în localStorage:', error);
        }
    };

    // Returnăm exact sub același format de array ca și useState
    return [storedValue, setValue] as const;
}
