import { cookies } from "next/headers";
import { api } from "./api";
import { User } from "@/types/user";
import { Note, FetchNotesResponse } from "@/types/note";

export const getServerMe = async (): Promise<User> => {
  const cookieStore = await cookies();
  const { data } = await api.get("/users/me", {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
  return data;
};

export const serverApi = async () => {
  const cookieStore = await cookies();
  const response = await api.get("/auth/session", {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response;
};

export async function fetchNotes(
  page?: number,
  searchQuery?: string,
  tag?: string,
) {
  const cookieStore = await cookies();

  const response = await api.get("/notes", {
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