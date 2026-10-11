# QuickNotes System Design

QuickNotes is a note-taking application project that demonstrates frontend API integration and backend system design. Users can practise creating, viewing, and deleting notes through an API client while the documentation describes how a scalable production version could be designed.

## Features

- Load notes from an API using GET.
- Create notes using POST.
- Delete notes using DELETE.
- Display loading, success, error, and empty states.
- Validate note titles and limit them to 100 characters.
- Design a REST API for a future QuickNotes backend.
- Document the database schema, relationships, and system architecture.

## Technologies Used

- HTML5 for the page structure.
- CSS3 for styling and responsive layout.
- JavaScript for API requests and user interactions.
- Fetch API for HTTP communication.
- JSONPlaceholder as a practice API.
- Markdown for system design documentation.
- PostgreSQL as the proposed relational database.

## Project Structure

```text
quicknotes-system-design/
├── index.html
├── api.js
├── style.css
├── docs/
│   ├── api-design.md
│   ├── data-model.md
│   └── architecture.md
└── README.md
```

## How to Run the API Client

### Requirements

- A modern web browser.
- An internet connection to access JSONPlaceholder.
- A local development server, such as VS Code Live Server, or another static file server.

### Steps

1. Clone the repository or open the existing project folder.
2. Start a local static server in the project directory.
3. Open the local URL provided by the server in your browser.
4. Click **Load notes** to retrieve notes.
5. Enter a title and optional body, then click **Create note**.
6. Click **Delete** on a note to remove it from the current page.

The client uses the JSONPlaceholder API at `https://jsonplaceholder.typicode.com/posts`.

For example, if Python is installed, you can start a local server by running:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### Important API Limitation

JSONPlaceholder is a testing API. It simulates creating and deleting resources but does not permanently persist those changes. Notes created or deleted during testing may not remain changed after the page is refreshed.

The documented QuickNotes API is a proposed backend design; its endpoints are not implemented by JSONPlaceholder.

## System Design Documentation

- [API Design](docs/api-design.md) — REST endpoints, request and response examples, status codes, and error handling.
- [Data Model](docs/data-model.md) — Database tables, relationships, SQL queries, indexes, and the SQL versus NoSQL decision.
- [Architecture](docs/architecture.md) — System components, traffic estimates, request flows, scaling trade-offs, and reliability.

## What I Learned

1. **API integration:** How to use JavaScript's Fetch API with GET, POST, and DELETE requests, check HTTP responses, and handle errors with `try...catch...finally`.
2. **Frontend validation and safety:** How to validate form input, disable buttons during requests, display feedback, and use `textContent` to insert user-provided text safely.
3. **REST API design:** How HTTP methods, resource-based URLs, status codes, authentication, and consistent error responses fit together.
4. **Database design:** How primary keys, foreign keys, one-to-many relationships, many-to-many relationships, indexes, and JOIN queries organize data.
5. **System architecture:** How load balancers, multiple application servers, caches, database replicas, queues, and workers can support scalability and reliability.
6. **Trade-offs:** Why architectural choices such as caching and read replicas can improve performance while introducing consistency and operational challenges.

## Future Improvements

- Connect the client to a real QuickNotes backend.
- Add user registration and authentication.
- Persist notes in a PostgreSQL database.
- Add note editing, search, and tag management.
- Add automated tests and deployment configuration.
- Improve accessibility and mobile responsiveness.

## License

This project was created for educational purposes.
