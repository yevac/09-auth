import { nextServer } from "./api";
import type { Note, CreateNotePayload, FetchNotesResponse } from "@/types/note";
import type {
  LoginRequest,
  RegisterRequest,
  UpdateUserRequest,
} from "@/types/auth";
import type { User } from "@/types/user";

export async function fetchSingleNoteById(id: string) {
  const response = await nextServer.get<Note>(`/notes/${id}`);
  return response.data;
}

export async function fetchNotes(
  page?: number,
  searchQuery?: string,
  tag?: string,
) {
  const response = await nextServer.get<FetchNotesResponse>("/notes", {
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
  const response = await nextServer.post<Note>("/notes", payload);
  return response.data;
}

export async function deleteNote(noteId: Note["id"]) {
  const response = await nextServer.delete<Note>(`/notes/${noteId}`);
  return response.data;
}

export const register = async (payload: RegisterRequest) => {
  const response = await nextServer.post<User>("/auth/register", payload);
  return response.data;
};

export const login = async (payload: LoginRequest) => {
  const response = await nextServer.post<User>("/auth/login", payload);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await nextServer.post("/auth/logout");
};

export const updateMe = async (payload: UpdateUserRequest) => {
  const { data } = await nextServer.patch<User>("/users/me", payload);
  return data;
};

export const getMe = async () => {
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

export const checkSession = async () => {
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