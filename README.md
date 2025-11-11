# SaiKet Systems Internship Tasks

## Overview
This repository contains a compact front-end showcase built for the SaiKet Systems internship program. It demonstrates five self-contained tasks inside a single landing page, each accessible through an interactive modal. The project is implemented with plain HTML, CSS, and JavaScript so it can run in any modern browser without additional tooling.

## Features
- **Task 1 – Loan EMI Calculator:** Computes monthly installments using the standard annuity formula and basic input validation.
- **Task 2 – Public API Demo:** Fetches a random programming joke from the Official Joke API with loading and error states.
- **Task 3 – Local Storage Blog:** Lets users create, persist, and delete mini blog posts completely in-browser.
- **Task 4 – Number Guessing Game:** Generates a random number, tracks attempts, and provides feedback hints.
- **Task 5 – Contact Book:** Stores contact entries locally, supports inline deletion, and filters results by name.

## Project Structure
```
.
├── assets/            # Static assets such as the SaiKet logo
├── index.html         # Landing page and modal markup
├── script.js          # Task logic, modal handling, and storage helpers
└── styles.css         # Visual styling and responsive layout rules
```

## Getting Started
1. **Download or Clone**
   ```bash
   git clone <repository-url>
   cd Saiket-dev-project
   ```
2. **Open Locally**
   - Double-click `index.html`, or
   - Serve the directory with any static file server (e.g., `npx serve .`) for a localhost preview.
3. **Browser Requirements**
   - Any modern browser (Chrome, Edge, Firefox, Safari). Local storage features require enabling cookies/local data.

## Usage Notes
- Modal state and task data persist only in the current browser; local storage entries are scoped to the same domain/origin.
- The joke API (Task 2) requires an active internet connection. Errors are surfaced in the UI if the fetch fails.
- To reset stored blog posts or contacts, clear your browser’s local storage for the site.

## Customization Ideas
- Swap in your own branding by updating assets in `assets/` and text in `index.html`.
- Replace the joke API with another public endpoint by editing the fetch call in `script.js`.
- Extend Task 5 with import/export (JSON) or validation logic tailored to your use case.

## License
This project currently has no explicit license. Add one (e.g., MIT, Apache 2.0) if you plan to publish or share the code publicly.

