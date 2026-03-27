// Definim tipul de bază pentru un prompt în aplicația noastră
export interface Prompt {
    id: string;              // Identificator unic (ex: UUID)
    title: string;           // Titlul scurt al prompt-ului
    body: string;            // Textul complet pe care îl vom trimite modelului
    tags: string[];          // Etichete pentru organizare și căutare ușoară
    model: string;           // Modelul recomandat pentru acest prompt (ex: "GPT-4.1", "Claude 3.7")
    createdAt: string;       // Data creării în format ISO string (ex: "2026-03-25T20:45:00Z")
    updatedAt: string;       // Data ultimei modificări în format ISO string
    workspaceId?: string;    // ID-ul workspace-ului căruia îi aparține (opțional)
}

// Un workspace este un dosar virtual pentru gruparea prompt-urilor
export interface Workspace {
    id: string;        // Identificator unic
    name: string;      // Numele afișat (ex: "Coding Assistant")
    icon: string;      // Emoji sau caracter scurt pentru iconiță vizuală
    color: string;     // Culoarea de accent a workspace-ului (hex)
    createdAt: string; // Data creării
}

// O versiune salvată a corpului unui prompt, creată la fiecare editare
export interface PromptVersion {
    promptId: string;  // ID-ul prompt-ului căruia îi aparține
    body: string;      // Corpul textului la momentul snapshot-ului
    savedAt: string;   // Data salvării versiunii (ISO string)
    label?: string;    // Eticheta opțională introdusă de utilizator
}
