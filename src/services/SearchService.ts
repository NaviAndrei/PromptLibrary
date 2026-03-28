import FlexSearch from 'flexsearch';
import type { Prompt } from '../types';

// Vite 8 (Rolldown) requires accessing FlexSearch classes via default import.
// Using 'any' here is intentional — FlexSearch's ESM bundle doesn't ship TypeScript types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FlexSearchAny = FlexSearch as any;

interface SearchResult {
    field: string;
    result: (string | number)[];
}

/**
 * High-performance search service using FlexSearch's Document Index.
 * This singleton resides in memory for ultra-fast (O(1) perception) full-text searching.
 */
class SearchService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private index: any;
    private initialized = false;

    constructor() {
        this.index = new FlexSearchAny.Document({
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
     * Rebuilds the entire index from a fresh set of prompts.
     */
    public initialize(prompts: Prompt[]) {
        if (this.initialized) {
            this.rebuild(prompts);
            return;
        }

        prompts.forEach(p => this.index.add(p));
        this.initialized = true;
        console.log(`[Search] Search index initialized with ${prompts.length} prompts.`);
    }

    private rebuild(prompts: Prompt[]) {
        this.index = new FlexSearchAny.Document({
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
     * Returns an array of string IDs matching the query.
     */
    public search(query: string): string[] {
        if (!query.trim()) return [];

        const results: SearchResult[] = this.index.search(query, {
            enrich: false,
            limit: 100,
            suggest: true
        });

        // Flatten the multi-field result format: [{ field: 'title', result: [...] }, ...]
        const ids = new Set<string>();
        results.forEach((res: SearchResult) => {
            res.result.forEach((id: string | number) => ids.add(String(id)));
        });

        return Array.from(ids);
    }
}

export const searchService = new SearchService();
