"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      router.refresh();
    });
  }, []);

  return <>{isPending ? <div>Loading...</div> : children}</>;
}
