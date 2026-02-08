import { cookies } from "next/headers";
import { api } from "./api";
import type { User } from "@/types/user";
import type { Note, NoteTag } from "@/types/note";

function getCookieHeader() {
  const cookieStore = cookies(); // без await
  const cookie = cookieStore.toString();
  return cookie ? { cookie } : {};
}

export async function checkSessionServer(): Promise<User | null> {
  try {
    const { data } = await api.get<User | null>("/auth/session", {
      headers: getCookieHeader(),
    });
    return data;
  } catch {
    return null;
  }
}

export async function getMeServer(): Promise<User> {
  const { data } = await api.get<User>("/users/me", {
    headers: getCookieHeader(),
  });
  return data;
}

export async function fetchNotesServer(params: {
  page: number;
  perPage: number;
  search?: string;
  tag?: NoteTag;
}) {
  const { data } = await api.get<{ notes: Note[]; totalPages: number }>("/notes", {
    params,
    headers: getCookieHeader(),
  });
  return data;
}
