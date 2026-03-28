import { useMemo, useEffect } from 'react';
import type { Prompt } from '../types';
import { searchService } from '../services/SearchService';

interface FilterOptions {
    searchQuery: string;
    selectedTag: string | null;
    currentWorkspaceId: string | null;
    selectedModel: string | null;
    dateRange: { start: Date | null, end: Date | null };
}

/**
 * Custom hook to encapsulate the complex prompt filtering logic with Full-Text Search.
 */
export function usePromptFilters(prompts: Prompt[], options: FilterOptions) {
    const { searchQuery, selectedTag, currentWorkspaceId, selectedModel, dateRange } = options;

    // Maintain the search index as prompts change
    useEffect(() => {
        searchService.initialize(prompts);
    }, [prompts]);

    const filteredPrompts = useMemo(() => {
        let result = prompts;

        // Perform specialized Full-Text Search if query is present
        if (searchQuery.trim()) {
            const matchedIds = searchService.search(searchQuery);
            if (matchedIds.length > 0) {
                // Intersect matches with the initial set
                result = result.filter(p => matchedIds.includes(p.id));
            } else {
                // Fallback to substring matching (for short queries FlexSearch might miss)
                const lowerQuery = searchQuery.toLowerCase();
                result = result.filter(p => {
                    const matchesTitle = p.title.toLowerCase().includes(lowerQuery);
                    const matchesBody = p.body.toLowerCase().includes(lowerQuery);
                    const matchesTags = p.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
                    return matchesTitle || matchesBody || matchesTags;
                });
            }
        }

        // 1. Filter by selected workspace
        if (currentWorkspaceId) {
            result = result.filter(p => p.workspaceId === currentWorkspaceId);
        }

        // 2. Filter by selected tag
        if (selectedTag) {
            result = result.filter(p => p.tags.includes(selectedTag));
        }

        // 3. Filter by selected AI model
        if (selectedModel) {
            result = result.filter(p => p.model === selectedModel);
        }

        // 4. Filter by date range (normalized to day inclusive)
        if (dateRange.start || dateRange.end) {
            result = result.filter(p => {
                const created = new Date(p.createdAt);
                if (dateRange.start) {
                    const s = new Date(dateRange.start);
                    s.setHours(0, 0, 0, 0);
                    if (created < s) return false;
                }
                if (dateRange.end) {
                    const e = new Date(dateRange.end);
                    e.setHours(23, 59, 59, 999);
                    if (created > e) return false;
                }
                return true;
            });
        }

        return result;
    }, [prompts, searchQuery, selectedTag, currentWorkspaceId, selectedModel, dateRange]);

    return filteredPrompts;
}
