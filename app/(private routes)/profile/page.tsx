import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import type { User } from "@/types/user";
import { getMeServer } from "@/lib/api/serverApi";
import css from "./ProfilePage.module.css";

export const metadata: Metadata = {
  title: "Profile | NoteHub",
  description: "Your NoteHub profile",
  alternates: { canonical: "/profile" },
  openGraph: {
    title: "Profile | NoteHub",
    description: "Your NoteHub profile",
    url: "/profile",
  },
};

export default async function Profile() {
  let user: User | null = null;

  try {
    user = await getMeServer();
  } catch {
    redirect("/sign-in");
  }

  if (!user) redirect("/sign-in");

  return (
    <div className={css.mainContent}>
      <section className={css.profileCard}>
        <h1 className={css.formTitle}>My Profile</h1>

        <div className={css.profileInfo}>
          <div className={css.avatar}>
            <Image
              src={user.avatar || "/user-default-photo.webp"}
              width={300}
              height={300}
              alt="Avatar"
            />
          </div>

          <h2>Name: {user.username}</h2>
          <h2>Email: {user.email}</h2>

          <p>
            Some description: Lorem ipsum dolor sit amet consectetur adipisicing
            elit...
          </p>
        </div>

        <Link href="/profile/edit" className={css.editProfileButton}>
          Edit profile
        </Link>
      </section>
    </div>
  );
}
