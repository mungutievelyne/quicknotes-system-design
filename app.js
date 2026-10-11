const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const statusMessage = document.getElementById("status");
const notesList = document.getElementById("notes-list");

const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

// Reusable function for HTTP requests.
async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  // DELETE endpoints can return 204 No Content.
  if (response.status === 204) {
    return { data: null, status: response.status };
  }

  const data = await response.json();

  return { data, status: response.status };
}

// Build note elements safely using textContent.
function createNoteElement(note) {
  const item = document.createElement("li");
  item.className = "note";
  item.dataset.id = note.id;

  const title = document.createElement("h3");
  title.textContent = note.title;

  const body = document.createElement("p");
  body.textContent = note.body || "No body provided.";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "Delete";

  deleteButton.addEventListener("click", () => deleteNote(note.id, item, deleteButton));

  item.append(title, body, deleteButton);

  return item;
}

function renderNote(note) {
  notesList.appendChild(createNoteElement(note));
}

async function loadNotes() {
  loadButton.disabled = true;
  showStatus("Loading notes...");
  notesList.replaceChildren();

  try {
    const result = await request(`${API_URL}?_limit=10`);
    const notes = result.data;

    if (notes.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.textContent = "No notes found. Create your first note!";
      notesList.appendChild(emptyItem);
      showStatus("No notes found.", "success");
      return;
    }

    notes.forEach(renderNote);
    showStatus(`Loaded ${notes.length} notes from the server.`, "success");
  } catch (error) {
    showStatus("Sorry, we couldn't load your notes. Please try again.", "error");
    console.error("Error loading notes:", error);
  } finally {
    loadButton.disabled = false;
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    showStatus("Please enter a title.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    showStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  showStatus("Creating note...");

  try {
    const result = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        body,
        userId: 1
      })
    });

    const newNote = result.data;

    // JSONPlaceholder simulates creation but does not permanently store posts.
    // Keep the created note in the current page session.
    notesList.prepend(createNoteElement(newNote));

    showStatus(
      `Note created (status ${result.status}, id ${newNote.id}).`,
      "success"
    );

    noteForm.reset();
  } catch (error) {
    showStatus("Sorry, we couldn't create your note. Please try again.", "error");
    console.error("Error creating note:", error);
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteNote(noteId, noteElement, deleteButton) {
  deleteButton.disabled = true;
  showStatus("Deleting note...");

  try {
    const result = await request(`${API_URL}/${noteId}`, {
      method: "DELETE"
    });

    // JSONPlaceholder simulates deletion; it does not permanently change its data.
    // Remove the note from the current page after the successful response.
    noteElement.remove();

    if (notesList.children.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.textContent = "No notes found. Create your first note!";
      notesList.appendChild(emptyItem);
    }

    showStatus(
      `Note ${noteId} deleted (status ${result.status}).`,
      "success"
    );
  } catch (error) {
    showStatus(
      `Sorry, we couldn't delete note ${noteId}. Please try again.`,
      "error"
    );
    console.error("Error deleting note:", error);
  } finally {
    deleteButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);