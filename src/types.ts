// Definim tipul de bază pentru un prompt în aplicația noastră
export interface Prompt {
    id: string;          // Identificator unic (ex: UUID)
    title: string;       // Titlul scurt al prompt-ului
    body: string;        // Textul complet pe care îl vom trimite modelului
    tags: string[];      // Etichete pentru organizare și căutare ușoară
    model: string;       // Modelul recomandat pentru acest prompt (ex: "GPT-4.1", "Claude 3.7")
    createdAt: string;   // Data creării în format ISO string (ex: "2026-03-25T20:45:00Z")
    updatedAt: string;   // Data ultimei modificări în format ISO string
}
