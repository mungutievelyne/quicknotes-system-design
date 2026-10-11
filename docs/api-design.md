# QuickNotes API Design

## 1. Overview

The QuickNotes API allows users to create, view, update, and delete notes. Users can also organize their notes using tags.

The API follows REST principles and uses HTTP methods to perform operations on resources. Requests and responses use JSON.

**Base URL:** `/api`

**Authentication:** Protected endpoints require a valid access token in the `Authorization` header.

Example:

```http
Authorization: Bearer <token>
```

Each authenticated user can access and modify only their own notes.

## 2. Endpoints

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| GET | `/api/notes` | List the authenticated user's notes | 200 OK |
| GET | `/api/notes/{noteId}` | Retrieve one note by ID | 200 OK |
| POST | `/api/notes` | Create a new note | 201 Created |
| PATCH | `/api/notes/{noteId}` | Update a note's title or body | 200 OK |
| DELETE | `/api/notes/{noteId}` | Delete a note | 204 No Content |
| GET | `/api/tags` | List the user's tags | 200 OK |
| POST | `/api/notes/{noteId}/tags` | Add a tag to a note | 201 Created |

## 3. Request and Response Examples

### A. Create a note

**Request**

```http
POST /api/notes
Content-Type: application/json
Authorization: Bearer <token>
```

Request body:

```json
{
  "title": "Project meeting",
  "body": "Prepare the presentation for Friday."
}
```

**Successful response — 201 Created**

```json
{
  "id": 101,
  "title": "Project meeting",
  "body": "Prepare the presentation for Friday.",
  "userId": 1,
  "createdAt": "2026-10-11T10:00:00Z",
  "updatedAt": "2026-10-11T10:00:00Z"
}
```

The server generates the note ID and timestamps. The user ID comes from the authenticated session rather than being trusted from the request body.

### B. List notes

**Request**

```http
GET /api/notes
Authorization: Bearer <token>
```

**Successful response — 200 OK**

```json
{
  "data": [
    {
      "id": 101,
      "title": "Project meeting",
      "body": "Prepare the presentation for Friday.",
      "userId": 1,
      "createdAt": "2026-10-11T10:00:00Z",
      "updatedAt": "2026-10-11T10:00:00Z"
    },
    {
      "id": 102,
      "title": "Shopping list",
      "body": "Buy notebooks and pens.",
      "userId": 1,
      "createdAt": "2026-10-11T11:00:00Z",
      "updatedAt": "2026-10-11T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2
  }
}
```

The API supports pagination so that clients can retrieve notes in manageable groups.

### C. Update a note

**Request**

```http
PATCH /api/notes/101
Content-Type: application/json
Authorization: Bearer <token>
```

Request body:

```json
{
  "title": "Updated project meeting",
  "body": "Finish the presentation before Friday."
}
```

**Successful response — 200 OK**

```json
{
  "id": 101,
  "title": "Updated project meeting",
  "body": "Finish the presentation before Friday.",
  "userId": 1,
  "createdAt": "2026-10-11T10:00:00Z",
  "updatedAt": "2026-10-11T12:00:00Z"
}
```

### D. Delete a note

**Request**

```http
DELETE /api/notes/101
Authorization: Bearer <token>
```

**Successful response — 204 No Content**

The server deletes the note and returns no response body.

## 4. Error Handling

The API returns an appropriate HTTP status code and a JSON error message when a request fails.

| Status | Error | Meaning |
|---|---|---|
| 400 | Bad Request | The request contains invalid data |
| 401 | Unauthorized | Authentication is missing or invalid |
| 403 | Forbidden | The user is not permitted to perform the operation |
| 404 | Not Found | The requested resource does not exist or cannot be accessed |
| 500 | Internal Server Error | An unexpected server-side error occurred |

Example error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The note title is required."
  }
}
```

Another example, when authentication is missing:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Please log in to continue."
  }
}
```

The API should validate input, avoid exposing sensitive server details, and return consistent error formats.

## 5. Validation and Security

- A note title is required and must contain no more than 100 characters.
- The note body is optional.
- The server validates all incoming data.
- Protected endpoints require authentication.
- Users may access only notes and tags they are authorized to manage.
- Database queries should use parameterized inputs to reduce SQL injection risks.
- The API should use HTTPS in production.

## 6. API Client and Backend Difference

The current QuickNotes frontend uses JSONPlaceholder at `https://jsonplaceholder.typicode.com/posts` to practise GET, POST, and DELETE requests.

The endpoints documented above describe the **proposed QuickNotes backend API**. They are a design specification, not a claim that these routes are already implemented by JSONPlaceholder or another running server.
