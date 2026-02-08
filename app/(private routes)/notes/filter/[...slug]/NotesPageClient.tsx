"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebounceValue } from "usehooks-ts";

import css from "./NotesPage.module.css";

import type { FetchNotesResponse, NoteTag } from "@/types/note";
import { getNotes } from "@/lib/api/clientApi";
import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";
import SearchBox from "@/components/SearchBox/SearchBox";
import ErrorBox from "@/components/ErrorBox/ErrorBox";
import Loader from "@/components/Loader/Loader";
import Link from "next/link";

interface NotesPageProps {
  initialPage: number;
  initialSearch: string;
  tag?: NoteTag;
}

export default function NotesPage({
  initialPage,
  initialSearch,
  tag,
}: NotesPageProps) {
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch] = useDebounceValue(search, 1000);

  const { data, isLoading, isError, error, isRefetching } =
    useQuery<FetchNotesResponse>({
  queryKey: ["notes", { page, search: debouncedSearch, tag }],
  queryFn: () =>
    getNotes({
      page,
      perPage: 12,
      search: debouncedSearch,
      tag,
    }),
  placeholderData: keepPreviousData,
  staleTime: 60 * 1000,
});


  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div>
      <div className={css.app}>
        <header className={css.toolbar}>
          <SearchBox value={search} onSearch={handleSearchChange} />

          {data?.totalPages && data?.totalPages > 1 ? (
            <Pagination
              totalPages={data?.totalPages ?? 0}
              page={page}
              onPageChange={setPage}
            />
          ) : null}

          <div className={css.button}>
            <Link href="/notes/action/create">Create note +</Link>
          </div>
        </header>
        <div className={css.contentContainer}>
          {isLoading && <Loader />}

          {data && !isLoading && <NoteList notes={data.notes} />}

          {isRefetching && !isLoading && <Loader />}

          {!isError && !isLoading && !data?.notes?.length && !isLoading && (
            <ErrorBox query={debouncedSearch} />
          )}
          {isError && <ErrorBox errorMessage={error.message} />}
        </div>
      </div>
    </div>
  );
}