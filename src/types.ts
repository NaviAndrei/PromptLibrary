// Base type for a prompt in our application
export interface Prompt {
    id: string;              // Unique identifier (UUID)
    title: string;           // Short title of the prompt
    body: string;            // The full text to be sent to the AI model
    tags: string[];          // Labels for easy organization and search
    model: string;           // Recommended model for this prompt (e.g., "GPT-4o", "Claude 3.5 Sonnet")
    createdAt: string;       // Creation date in ISO string format
    updatedAt: string;       // Last modification date in ISO string format
    workspaceId?: string;    // ID of the workspace it belongs to (optional)
}

// A workspace is a virtual folder for grouping related prompts
export interface Workspace {
    id: string;        // Unique identifier
    name: string;      // Display name (e.g., "Coding Assistant")
    icon: string;      // Emoji or short character for visual icon
    color: string;     // Workspace accent color (hex)
    createdAt: string; // Creation date
}

// A saved version of a prompt body, created on every edit
export interface PromptVersion {
    promptId: string;  // ID of the prompt it belongs to
    body: string;      // The text body at the time of the snapshot
    savedAt: string;   // Timestamp of the saved version (ISO string)
    label?: string;    // Optional label provided by the user
}
