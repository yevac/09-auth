import { cookies } from "next/headers";
import { nextServer } from "./api";

import { User } from "@/types/user";
import { Note, FetchNotesResponse } from "@/types/note";

export const getServerMe = async (): Promise<User> => {
  const cookieStore = await cookies();
  const { data } = await nextServer.get("/users/me", {
    headers: {
      cookie: cookieStore.toString(),
    },
  });
  return data;
};

export const checkServerSession = async () => {

  const cookieStore = await cookies();
  const response = await nextServer.get("/auth/session", {
    headers: {

      cookie: cookieStore.toString(),
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

  const response = await nextServer.get("/notes", {
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

  const response = await nextServer.get<Note>(`/notes/${id}`, {
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
