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
        result: string[];
    }

    export class Index {
        constructor(options?: IndexOptions);
        add(id: string | number, content: string): void;
        search(query: string, limit?: number): string[];
        update(id: string | number, content: string): void;
        remove(id: string | number): void;
    }

    export class Document {
        constructor(options?: IndexOptions);
        add(doc: object): void;
        search(query: string, options?: SearchOptions): SearchResult[];
        update(doc: object): void;
        remove(id: string | number): void;
    }
}
