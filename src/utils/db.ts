/**
 * Low-level IndexedDB wrapper for the Prompt Library.
 * Provides a transactional, asynchronous storage system to bypass the 5MB localStorage limit.
 */
export class PromptDatabase {
    private dbName = 'PromptLibraryDB';
    private version = 1;

    private async getDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                // Create object stores (tables) if they don't exist
                if (!db.objectStoreNames.contains('prompts')) {
                    db.createObjectStore('prompts', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('workspaces')) {
                    db.createObjectStore('workspaces', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('history')) {
                    // Optimized to use compound keys: PromptVersion doesn't need an artificial 'id'
                    db.createObjectStore('history', { keyPath: ['promptId', 'savedAt'] });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Internal helper to handle transactions
     */
    private async perform<T>(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest): Promise<T> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            const request = action(store);

            // Ensure callers only proceed when the transaction is definitively committed
            transaction.oncomplete = () => resolve(request.result);
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(new Error('IndexedDB Transaction Aborted'));
        });
    }

    /**
     * Specialized batch operation to handle multiple writes in a single request transaction.
     * Dramatically improves O(1) reactive write speed for large prompt datasets.
     */
    async putBatch<T>(storeName: string, data: T[]): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            store.clear();
            data.forEach(item => store.put(item));

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(new Error('IndexedDB Batch Put Aborted'));
        });
    }

    // --- Public API ---

    async getAll<T>(storeName: string): Promise<T[]> {
        return this.perform<T[]>(storeName, 'readonly', store => store.getAll());
    }

    async put<T>(storeName: string, data: T): Promise<void> {
        await this.perform(storeName, 'readwrite', store => store.put(data));
    }

    async delete(storeName: string, id: string): Promise<void> {
        await this.perform(storeName, 'readwrite', store => store.delete(id));
    }

    async clear(storeName: string): Promise<void> {
        await this.perform(storeName, 'readwrite', store => store.clear());
    }
}

export const dbInstance = new PromptDatabase();
