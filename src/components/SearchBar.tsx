import { Search } from 'lucide-react';

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

// Search bar component with icon and premium UX
export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
    return (
        <div className="search-container">
            <Search className="search-icon" size={18} />
            <input
                type="text"
                className="search-input"
                placeholder="Search by title, tags, or content..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Search prompts"
            />
        </div>
    );
}
