"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { checkSession, getMe } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";

const PRIVATE_PREFIXES = ["/notes", "/profile"];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const setUser = useAuthStore((s) => s.setUser);
  const clearIsAuthenticated = useAuthStore((s) => s.clearIsAuthenticated);

  const [loading, setLoading] = useState(true);

   useEffect(() => {
    const init = async () => {
      try {
        const session = await checkSession();

        if (session) {
          const user = await getMe();
          setUser(user);
        } else {
          clearIsAuthenticated();
        }
      } catch {
        clearIsAuthenticated();
        const isPrivate = PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
        if (isPrivate) router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [pathname, router, setUser, clearIsAuthenticated]);

  if (loading) return null;

  return <>{children}</>;
}
