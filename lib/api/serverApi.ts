import { cookies } from "next/headers";
import type { User } from "@/types/user";
import type { Note, FetchNotesResponse } from "@/types/note";
import { api } from "./api";

export const getServerMe = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/session`, {
      headers: {
        cookie: cookieStore.toString(),
      },
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

export const checkServerSession = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/session`, {
      headers: {
        cookie: cookieStore.toString(),
      },
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

export async function fetchNotes(
  page?: number,
  searchQuery?: string,
  tag?: string,
) {
  const cookieStore = await cookies();

  const response = await api.get<FetchNotesResponse>("/notes", {
    params: {
      page,
      perPage: 12,
      sortBy: "created",
      search: searchQuery,
      tag,
    },
    headers: {
      cookie: cookieStore.toString(),
    },
  });

  return response.data;
}

export const fetchSingleNoteById = async (id: string): Promise<Note> => {
  const cookieStore = await cookies();

  const response = await api.get<Note>(`/notes/${id}`, {
    headers: {
      cookie: cookieStore.toString(),
    },
  });

  return response.data;
};

export async function fetchTags() {
  const { notes }: FetchNotesResponse = await fetchNotes();

  if (notes.length === 0) return [];

  const tags = notes.reduce<string[]>((accu, note) => {
    if (!accu.includes(note.tag)) {
      accu.push(note.tag);
    }
    return accu;
  }, []);

  return tags;
}