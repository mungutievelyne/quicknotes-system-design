const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const statusMessage = document.getElementById("status");
const notesList = document.getElementById("notes-list");

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

// Reusable function for making HTTP requests.
async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  // Some successful responses, such as DELETE, may have no body.
  if (response.status === 204) {
    return { data: null, status: response.status };
  }

  const data = await response.json();

  return { data, status: response.status };
}

function renderNote(note) {
  const item = document.createElement("li");
  item.className = "note";

  const title = document.createElement("h3");
  title.textContent = note.title;

  const body = document.createElement("p");
  body.textContent = note.body || "No body provided.";

  item.append(title, body);
  notesList.appendChild(item);
}

async function loadNotes() {
  loadButton.disabled = true;
  showStatus("Loading notes...");
  notesList.replaceChildren();

  try {
    const result = await request(`${API_URL}?_limit=10`);
    const notes = result.data;

    if (notes.length === 0) {
      showStatus("No notes found.", "success");

      const emptyItem = document.createElement("li");
      emptyItem.textContent = "Your notes will appear here when available.";
      notesList.appendChild(emptyItem);
      return;
    }

    notes.forEach(renderNote);
    showStatus(`Loaded ${notes.length} notes from the server.`, "success");
  } catch (error) {
    showStatus(
      "Sorry, we couldn't load your notes. Please try again.",
      "error"
    );
    console.error("Error loading notes:", error);
  } finally {
    loadButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadNotes);