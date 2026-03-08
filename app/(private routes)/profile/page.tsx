import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getServerMe } from "@/lib/api/serverApi";
import css from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const user = await getServerMe();

  if (!user) {
    return {
      title: "Profile",
      description: "User profile page",
    };
  }

  return {
    title: `${user.username} | Profile`,
    description: `${user.username}'s profile page`,
  };
}

export default async function Profile() {
  const user = await getServerMe();

  if (!user) {
    return (
      <div className={css.mainContent}>
        <section className={css.profileCard}>
          <h1 className={css.formTitle}>My Profile</h1>
          <p>User not found</p>
        </section>
      </div>
    );
  }

  return (
    <div className={css.mainContent}>
      <section className={css.profileCard}>
        <h1 className={css.formTitle}>My Profile</h1>

        <div className={css.profileInfo}>
          <div className={css.avatar}>
            <Image
              src={user.avatar || "/user-defaul-photo.webp"}
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