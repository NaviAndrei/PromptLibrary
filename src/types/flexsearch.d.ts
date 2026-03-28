declare module 'flexsearch' {
    export interface SearchOptions {
        limit?: number;
        suggest?: boolean;
        enrich?: boolean;
    }

    export interface IndexOptions {
        preset?: string;
        tokenize?: string;
        cache?: boolean;
        document?: {
            id: string;
            index: string[];
        };
    }

    export interface SearchResult {
        field: string;
        result: (string | number)[]; // FlexSearch Id type is string | number
    }

    export class Index {
        constructor(options?: IndexOptions);
        add(id: string | number, content: string): void;
        search(query: string, limit?: number): string[];
        update(id: string | number, content: string): void;
        remove(id: string | number): void;
    }

    export class Document<T = object> {
        constructor(options?: IndexOptions);
        add(doc: T): void;
        search(query: string, options?: SearchOptions): SearchResult[];
        update(doc: T): void;
        remove(id: string | number): void;
    }
}
