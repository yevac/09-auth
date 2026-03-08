"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getMe, updateMe } from "@/lib/api/clientApi";
import css from "./page.module.css";

export default function EditProfile() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getMe();

        if (!user) {
          router.push("/sign-in");
          return;
        }

        setUsername(user.username ?? "");
        setEmail(user.email ?? "");
        setAvatar(user.avatar ?? "");
      } catch {
        router.push("/sign-in");
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleSubmit = async (formData: FormData) => {
    try {
      const data = {
        username: (formData.get("username") as string) ?? "",
        email: (formData.get("email") as string) ?? "",
        avatar: (formData.get("avatar") as string) ?? "",
      };

      await updateMe(data);
      router.push("/profile");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update profile");
      }
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main className={css.mainContent}>
      <h1 className={css.formTitle}>Edit profile</h1>

      <form className={css.form} action={handleSubmit}>
        <div className={css.formGroup}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={css.input}
            required
          />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={css.input}
            required
          />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="avatar">Avatar URL</label>
          <input
            id="avatar"
            name="avatar"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className={css.input}
          />
        </div>

        <button type="submit" className={css.submitButton}>
          Save
        </button>
      </form>

      {error && <p className={css.error}>{error}</p>}
    </main>
  );
}