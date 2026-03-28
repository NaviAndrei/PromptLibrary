

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

// Search bar component
// Receives the query and update function as props to be a controlled component
export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
    return (
        <div className="search-container">
            <input
                type="text"
                className="search-input"
                placeholder="Search by title, tags, or content..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
    );
}
