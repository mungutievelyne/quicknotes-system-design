# QuickNotes Data Model

## 1. Overview

QuickNotes uses a relational database to store users, notes, and tags. The database contains four tables: `users`, `notes`, `tags`, and `note_tags`.

The `users` table stores account information, the `notes` table stores note content, and the `tags` table stores labels used to organize notes. The `note_tags` table connects notes to tags.

## 2. Database Tables

### A. Users

Stores registered user accounts.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | Primary Key, Auto-generated | Unique user identifier |
| name | VARCHAR(100) | NOT NULL | User's display name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Securely hashed password |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation time |

Passwords must be stored as secure hashes, never as plain text.

### B. Notes

Stores notes created by users.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | Primary Key, Auto-generated | Unique note identifier |
| user_id | BIGINT | Foreign Key, NOT NULL | User who owns the note |
| title | VARCHAR(100) | NOT NULL | Note title |
| body | TEXT | NULL allowed | Note content |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last update time |

Each note belongs to one user.

### C. Tags

Stores tags that a user can use to categorize notes.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | Primary Key, Auto-generated | Unique tag identifier |
| user_id | BIGINT | Foreign Key, NOT NULL | User who owns the tag |
| name | VARCHAR(50) | NOT NULL | Tag name |

A tag belongs to one user. The combination of `user_id` and `name` must be unique so the same user cannot create duplicate tags with the same name.

### D. Note Tags

Connects notes to tags.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| note_id | BIGINT | Foreign Key, Primary Key | Linked note |
| tag_id | BIGINT | Foreign Key, Primary Key | Linked tag |

The composite primary key (`note_id`, `tag_id`) prevents the same tag from being attached to the same note more than once.

## 3. Relationships

### One-to-many: Users and Notes

One user can create many notes, but each note belongs to one user.

The `notes.user_id` foreign key references `users.id`.

### One-to-many: Users and Tags

One user can create many tags, but each tag belongs to one user.

The `tags.user_id` foreign key references `users.id`.

### Many-to-many: Notes and Tags

A note can have many tags, and a tag can be used on many notes.

The `note_tags` junction table implements this relationship through two foreign keys: `note_id` and `tag_id`.

## 4. SQL Table Definitions

The following SQL creates the four tables. It uses PostgreSQL syntax.

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    UNIQUE (user_id, name),
    UNIQUE (id, user_id)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

The unique constraint on `(id, user_id)` in `tags` allows the junction table to enforce that a note can only be linked to a tag owned by the same user.

```sql
ALTER TABLE note_tags
ADD COLUMN user_id BIGINT;
```

For a production implementation, the ownership relationship should be enforced with a composite foreign key instead of relying only on application checks. The following is the preferred definition of the junction table when creating the schema from scratch:

```sql
CREATE TABLE note_tags (
    note_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id, user_id)
        REFERENCES notes(id, user_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id, user_id)
        REFERENCES tags(id, user_id) ON DELETE CASCADE
);
```

For these composite foreign keys to work, `notes` must also have a unique constraint on `(id, user_id)`. Add `UNIQUE (id, user_id)` to the `notes` table definition when creating the schema from scratch. Use the preferred junction-table definition instead of the earlier simple `note_tags` definition; do not execute both versions together.

## 5. Example SQL Queries

### Query 1: Get all notes belonging to a user

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC;
```

This retrieves the user's notes, with recently updated notes appearing first.

### Query 2: Get a note together with its owner's name

```sql
SELECT
    notes.id,
    notes.title,
    notes.body,
    users.name AS owner_name
FROM notes
JOIN users ON notes.user_id = users.id
WHERE notes.id = 101;
```

This uses a JOIN to combine data from the `notes` and `users` tables.

### Query 3: Get all notes associated with a tag

```sql
SELECT
    notes.id,
    notes.title,
    tags.name AS tag_name
FROM notes
JOIN note_tags ON notes.id = note_tags.note_id
JOIN tags ON note_tags.tag_id = tags.id
WHERE notes.user_id = 1
  AND tags.user_id = 1
  AND tags.name = 'work';
```

This retrieves notes associated with the `work` tag for a particular user.

### Query 4: Count notes per user

```sql
SELECT
    users.id,
    users.name,
    COUNT(notes.id) AS total_notes
FROM users
LEFT JOIN notes ON users.id = notes.user_id
GROUP BY users.id, users.name
ORDER BY total_notes DESC;
```

This includes users who have not created any notes.

## 6. Indexing

Create an index on `notes.user_id`:

```sql
CREATE INDEX idx_notes_user_id
ON notes(user_id);
```

This index helps the database find a user's notes without scanning every row in the `notes` table. It is useful because listing a user's notes is a frequent operation.

The database automatically creates indexes for primary keys and unique constraints. Additional indexes should be added based on measured query performance.

## 7. SQL vs NoSQL

QuickNotes should use a relational SQL database such as PostgreSQL.

**Reasons for choosing SQL:**

- Notes have clear relationships with users and tags.
- Foreign keys help maintain data integrity.
- Transactions help ensure that related database changes succeed or fail together.
- SQL JOINs make it straightforward to retrieve notes with their owners and tags.
- Constraints can prevent duplicate emails, duplicate user tags, and duplicate note-tag relationships.

A NoSQL database could be useful if the application later needs highly flexible document structures or a different scaling strategy. However, SQL is a better fit for the current data model because the relationships and integrity requirements are well defined.

## 8. Data Integrity and Security

- Store password hashes rather than plain-text passwords.
- Validate note titles and tag names before inserting or updating records.
- Use parameterized SQL queries to help prevent SQL injection.
- Restrict queries so users can access only their own notes and tags.
- Use foreign keys and cascading deletes to prevent orphaned records.
- Back up the database regularly and test recovery procedures.

