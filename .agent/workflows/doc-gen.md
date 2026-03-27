---
description: Generează documentație tehnică bilingvă (RO/EN) pentru proiectul curent.
---

1. **Analiză Proiect**: Explorează structura proiectului folosind `list_dir` și citește fișierele principale (`.py`, [.md](cci:7://file:///d:/Projects/Python/.agent/workflows/ask.md:0:0-0:0)) pentru a înțelege logica.
2. **Generare Documentație RO**:
   - Creează sau actualizează `README_RO.md`.
   - Conținutul trebuie să fie în limba română.
   - **Regulă**: Termenii tehnici (ex: "endpoint", "middleware", "callback", "type hinting") rămân în engleză pentru claritate.
3. **Generare Documentație EN**:
   - Creează sau actualizează `README.md` (sau `README_EN.md`).
   - Conținutul trebuie să fie integral în limba engleză, folosind un ton profesional.
4. **Structură obligatorie pentru ambele**:
   - Descriere generală (Overview).
   - Arhitectura sistemului.
   - Detalii despre funcții/clase (Technical Reference).
   - Instrucțiuni de instalare și rulare.
5. **Finalizare**: Raportează utilizatorului locația fișierelor create.