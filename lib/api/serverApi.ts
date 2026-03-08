import { cookies } from "next/headers";
import type { AxiosResponse } from "axios";
import type { User } from "@/types/user";
import type { Note, FetchNotesResponse } from "@/types/note";
import { api } from "./api";

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
}

export const getServerMe = async (): Promise<User | null> => {
  try {
    const response = await api.get<User>("/auth/session", {
      headers: {
        Cookie: await getCookieHeader(),
      },
    });

    return response.data;
  } catch {
    return null;
  }
};

export const checkServerSession = async (): Promise<AxiosResponse<User> | null> => {
  try {
    const response = await api.get<User>("/auth/session", {
      headers: {
        Cookie: await getCookieHeader(),
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
  const response = await api.get<FetchNotesResponse>("/notes", {
    params: {
      page,
      perPage: 12,
      sortBy: "created",
      search: searchQuery,
      tag,
    },
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return response.data;
}

export const fetchSingleNoteById = async (id: string): Promise<Note> => {
  const response = await api.get<Note>(`/notes/${id}`, {
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return response.data;
};

export async function fetchTags(): Promise<string[]> {
  const { notes } = await fetchNotes();

  if (notes.length === 0) return [];

  return notes.reduce<string[]>((accu, note) => {
    if (!accu.includes(note.tag)) {
      accu.push(note.tag);
    }
    return accu;
  }, []);
}