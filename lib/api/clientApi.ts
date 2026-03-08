import { api } from "./api";
import type { Note, CreateNotePayload, FetchNotesResponse } from "@/types/note";
import type {
  LoginRequest,
  RegisterRequest,
  UpdateUserRequest,
} from "@/types/auth";
import type { User } from "@/types/user";

export async function fetchSingleNoteById(id: string): Promise<Note> {
  const response = await api.get<Note>(`/notes/${id}`);
  return response.data;
}

export async function fetchNotes(
  page?: number,
  searchQuery?: string,
  tag?: string,
): Promise<FetchNotesResponse> {
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

export async function deleteNote(noteId: Note["id"]): Promise<Note> {
  const response = await api.delete<Note>(`/notes/${noteId}`);
  return response.data;
}

export const register = async (payload: RegisterRequest): Promise<User> => {
  const response = await api.post<User>("/auth/register", payload);
  return response.data;
};

export const login = async (payload: LoginRequest): Promise<User> => {
  const response = await api.post<User>("/auth/login", payload);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const updateMe = async (payload: UpdateUserRequest): Promise<User> => {
  const response = await api.patch<User>("/users/me", payload);
  return response.data;
};

export const getMe = async (): Promise<User | null> => {
  try {
    const response = await api.get<User>("/auth/session");
    return response.data;
  } catch {
    return null;
  }
};

export const checkSession = async (): Promise<boolean> => {
  try {
    await api.get("/auth/session");
    return true;
  } catch {
    return false;
  }
};