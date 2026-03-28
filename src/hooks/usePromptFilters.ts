import { useMemo, useEffect, useRef } from 'react';
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

    // Track the previous prompts array for incremental index diffing
    const prevPromptsRef = useRef<Prompt[]>([]);

    // Maintain the search index with incremental updates instead of full rebuilds
    useEffect(() => {
        const prevPrompts = prevPromptsRef.current;

        if (!searchService.isInitialized) {
            // First load: build the full index once
            searchService.initialize(prompts);
        } else {
            // Subsequent changes: diff old vs new and apply only the deltas
            const prevMap = new Map(prevPrompts.map(p => [p.id, p]));
            const nextMap = new Map(prompts.map(p => [p.id, p]));

            // Removed prompts
            for (const [id] of prevMap) {
                if (!nextMap.has(id)) {
                    searchService.remove(id);
                }
            }

            // Added or updated prompts
            for (const [id, prompt] of nextMap) {
                if (!prevMap.has(id)) {
                    // New prompt — add to index
                    searchService.add(prompt);
                } else {
                    const prev = prevMap.get(id)!; // safe: id exists in prevMap (checked above)
                    // Update only when indexed fields changed; sort tags before comparing to handle reordering
                    const tagsChanged = JSON.stringify([...prev.tags].sort()) !== JSON.stringify([...prompt.tags].sort());
                    if (prev.updatedAt !== prompt.updatedAt || prev.title !== prompt.title || prev.body !== prompt.body || tagsChanged) {
                        searchService.update(prompt);
                    }
                }
            }
        }

        prevPromptsRef.current = prompts;
    }, [prompts]);

    const filteredPrompts = useMemo(() => {
        let result = prompts;

        // Perform specialized Full-Text Search if query is present
        if (searchQuery.trim()) {
            const matchedIds = new Set(searchService.search(searchQuery));
            if (matchedIds.size > 0) {
                // Intersect matches with the initial set (O(1) lookup via Set)
                result = result.filter(p => matchedIds.has(p.id));
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
