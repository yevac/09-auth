import { api } from "./api";
import type { Note, CreateNoteParams, NoteTag } from "@/types/note";
import { LoginRequest, RegisterRequest, CheckSessionRequest, UpdateUserRequest, } from "@/types/auth";
import { User } from "@/types/user";

export async function fetchNoteById(id: string) {
  const response = await api.get<Note>(`/notes/${id}`, {});
  return response.data;
}

export async function getNotes(params: {
  page: number;
  perPage: number;
  search?: string;
  tag?: NoteTag;
}) {
  const { page, perPage, search, tag } = params;

  const response = await api.get<{
    notes: Note[];
    totalPages: number;
  }>("/notes", {
    params: {
      page,
      perPage,
      search,
      tag,
    },
  });

  return response.data;
}
export async function createNote(payload: CreateNoteParams): Promise<Note> {
  const response = await api.post<Note>("/notes", payload);
  return response.data;
}

export async function deleteNote(noteId: Note["id"]) {
  const response = await api.delete<Note>(`/notes/${noteId}`);

  return response.data;
}

export const register = async (payload: RegisterRequest) => {
  const response = await api.post<User>("/auth/register", payload);
  return response.data;
};

export const login = async (payload: LoginRequest) => {
  const response = await api.post<User>("/auth/login", payload);
  return response.data;
};

export const checkSession = async () => {
  const response = await api.get<CheckSessionRequest>("/auth/session");
  return response.data;
};

export const getMe = async () => {
  const response = await api.get<User>("/users/me");
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const updateMe = async (payload: UpdateUserRequest) => {
  const { data } = await api.patch<User>("/users/me", payload);
  return data;
};