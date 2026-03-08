"use client";

import { checkSession, getMe } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

const PRIVATE_PREFIXES = ["/notes", "/profile"];

export default function AuthProvider({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const setUser = useAuthStore((state) => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    (state) => state.clearIsAuthenticated,
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const isAuthenticated = await checkSession();
        const isPrivate = PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));

        if (isAuthenticated) {
          const user = await getMe();
          if (user) setUser(user);
        } else {
          clearIsAuthenticated();
          if (isPrivate) router.replace("/sign-in");
        }
      } catch {
        clearIsAuthenticated();
        const isPrivate = PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
        if (isPrivate) router.replace("/sign-in");
      }
    };

    fetchUser();
  }, [pathname, router, setUser, clearIsAuthenticated]);

  return children;
}