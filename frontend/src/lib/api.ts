const API_URL = "http://localhost:5000/api/notes";

export async function getNotes() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch notes");
  }

  return response.json();
}

export async function createNote(note: {
  title: string;
  content: string;
  category: string;
  priority: string;
  pinned?: boolean;
  color?: string;
}) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error("Failed to create note");
  }

  return response.json();
}

export async function deleteNote(id: number) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete note");
  }

  return response.json();
}

export async function updateNote(
  id: number,
  note: {
    title: string;
    content: string;
    category: string;
    priority: string;
    pinned?: boolean;
    color?: string;
  }
) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error("Failed to update note");
  }

  return response.json();
}