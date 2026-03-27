

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

// Componentă pentru bara de căutare
// Primește interogarea și funcția de actualizare ca props pentru a fi un component controlat
export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
    return (
        <div className="search-container">
            <input
                type="text"
                className="search-input"
                placeholder="Caută în titlu, tag-uri sau conținut..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
    );
}
