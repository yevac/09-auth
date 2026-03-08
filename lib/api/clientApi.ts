import { api } from "./api";
import type { Note, CreateNotePayload, FetchNotesResponse } from "@/types/note";
import type {
  LoginRequest,
  RegisterRequest,
  UpdateUserRequest,
} from "@/types/auth";
import type { User } from "@/types/user";

export async function fetchSingleNoteById(id: string) {
  const response = await api.get<Note>(`/notes/${id}`);
  return response.data;
}

export async function fetchNotes(
  page?: number,
  searchQuery?: string,
  tag?: string,
) {
  const response = await api.get<FetchNotesResponse>("/notes", {
    params: {
      page,
      perPage: 12,
      sortBy: "created",
      search: searchQuery,
      tag,
    },
  });

  return response.data;
}

export async function createNote(payload: CreateNotePayload): Promise<Note> {
  const response = await api.post<Note>("/notes", payload);
  return response.data;
}

export async function deleteNote(noteId: Note["id"]) {
  const response = await api.delete<Note>(`/notes/${noteId}`);
  return response.data;
}

export const register = async (payload: RegisterRequest) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Registration failed");
  }

  return data as User;
};

export const login = async (payload: LoginRequest) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Login failed");
  }

  return data as User;
};

export const logout = async (): Promise<void> => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
};

export const updateMe = async (payload: UpdateUserRequest) => {
  const { data } = await api.patch<User>("/users/me", payload);
  return data;
};

export const getMe = async (): Promise<User | null> => {
  try {
    const response = await fetch("/api/auth/session", {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as User;
  } catch {
    return null;
  }
};

export const checkSession = async (): Promise<boolean> => {
  const user = await getMe();
  return Boolean(user);
};