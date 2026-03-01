import { cookies } from "next/headers";
import { api } from "./api";
import type { User } from "@/types/user";
import type { Note, NoteTag } from "@/types/note";
import type { AxiosResponse } from "axios";

function getCookieHeader(cookieFromOutside?: string) {
  if (cookieFromOutside) return { cookie: cookieFromOutside };

  const cookieStore = cookies();
  const cookie = cookieStore.toString();
  return cookie ? { cookie } : {};
}

export async function checkSessionServer(
  cookieFromOutside?: string
): Promise<AxiosResponse<User | null> | null> {
  try {
    const response = await api.get<User | null>("/auth/session", {
      headers: getCookieHeader(cookieFromOutside),
    });
    return response;
  } catch {
    return null;
  }
}

export async function refreshSessionServer(cookieFromOutside?: string): Promise<{
  accessToken: string;
  refreshToken?: string;
} | null> {
  try {
    const { data } = await api.post<{ accessToken: string; refreshToken?: string }>(
      "/auth/refresh",
      null,
      {
        headers: getCookieHeader(cookieFromOutside),
      }
    );
    return data;
  } catch {
    return null;
  }
}

export async function getMeServer(cookieFromOutside?: string): Promise<User> {
  const { data } = await api.get<User>("/users/me", {
    headers: getCookieHeader(cookieFromOutside),
  });
  return data;
}

export async function fetchNotesServer(
  params: {
    page: number;
    perPage: number;
    search?: string;
    tag?: NoteTag;
  },
  cookieFromOutside?: string
) {
  const { data } = await api.get<{ notes: Note[]; totalPages: number }>("/notes", {
    params,
    headers: getCookieHeader(cookieFromOutside),
  });
  return data;
}

export async function fetchNoteByIdServer(
  id: string,
  cookieFromOutside?: string
): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${id}`, {
    headers: getCookieHeader(cookieFromOutside),
  });
  return data;
}