import { Document } from 'flexsearch';
import type { SearchResult } from 'flexsearch';
import type { Prompt } from '../types';

/**
 * High-performance search service using FlexSearch's Document Index.
 * This singleton resides in memory for ultra-fast (O(1) perception) full-text searching.
 */
class SearchService {
    private index: Document;
    private initialized = false;

    constructor() {
        this.index = new Document({
            preset: 'match',
            tokenize: 'full',
            cache: true,
            document: {
                id: 'id',
                index: ['title', 'body', 'tags']
            }
        });
    }

    /**
     * Initializes or Re-builts the entire index from a fresh set of prompts.
     */
    public initialize(prompts: Prompt[]) {
        if (this.initialized) {
            // If already initialized, we could just return or clear
            // For now, let's just clear for a clean state
            // (Note: FlexSearch doesn't have a simple clear(), so we recreate)
            this.rebuild(prompts);
            return;
        }

        prompts.forEach(p => this.index.add(p));
        this.initialized = true;
        console.log(`[Search] Search index initialized with ${prompts.length} prompts.`);
    }

    private rebuild(prompts: Prompt[]) {
        this.index = new Document({
            preset: 'match',
            tokenize: 'full',
            cache: true,
            document: {
                id: 'id',
                index: ['title', 'body', 'tags']
            }
        });
        prompts.forEach(p => this.index.add(p));
        console.log(`[Search] Search index rebuilt with ${prompts.length} prompts.`);
    }

    /**
     * Incrementally add or update a prompt in the index.
     */
    public update(prompt: Prompt) {
        this.index.update(prompt);
    }

    /**
     * Remove a prompt from the index.
     */
    public remove(id: string) {
        this.index.remove(id);
    }

    /**
     * Perform a full-text search across title, body, and tags.
     * Returns an array of IDs matching the query.
     */
    public search(query: string): string[] {
        if (!query.trim()) return [];

        const results = this.index.search(query, {
            enrich: false,
            limit: 100, // Reasonable cap for UI
            suggest: true
        });

        // Flatten the multi-field result format provided by FlexSearch Document index
        // format: [{ field: 'title', result: [...] }, ...]
        const ids = new Set<string>();
        results.forEach((res: SearchResult) => {
            res.result.forEach((id: string) => ids.add(id));
        });

        return Array.from(ids);
    }
}

export const searchService = new SearchService();
