import { cookies } from "next/headers";
import type { AxiosResponse } from "axios";

import { api } from "./api";
import type { User } from "@/types/user";
import type { Note, FetchNotesResponse } from "@/types/note";

export const getServerMe = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();

    const response = await api.get<User>("/auth/session", {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response.data;
  } catch {
    return null;
  }
};

export const checkServerSession = async (): Promise<AxiosResponse<User> | null> => {
  try {
    const cookieStore = await cookies();

    const response = await api.get<User>("/auth/session", {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return response;
  } catch {
    return null;
  }
};

export async function fetchNotes(
  page?: number,
  searchQuery?: string,
  tag?: string,
): Promise<FetchNotesResponse> {
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
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
}

export const fetchSingleNoteById = async (id: string): Promise<Note> => {
  const cookieStore = await cookies();

  const response = await api.get<Note>(`/notes/${id}`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
};

export async function fetchTags(): Promise<string[]> {
  const { notes }: FetchNotesResponse = await fetchNotes();

  if (notes.length === 0) {
    return [];
  }

  const tags = notes.reduce<string[]>((accu, note) => {
    if (!accu.includes(note.tag)) {
      accu.push(note.tag);
    }

    return accu;
  }, []);

  return tags;
}