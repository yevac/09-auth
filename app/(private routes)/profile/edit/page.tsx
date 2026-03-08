"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getMe, updateMe } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import css from "./page.module.css";

export default function EditProfile() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
        setUser(user);
      } catch {
        router.push("/sign-in");
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, setUser]);

  const handleSubmit = async (formData: FormData) => {
    setError("");
    setSubmitting(true);

    try {
      const data = {
        username: (formData.get("username") as string) ?? "",
      };

      const updatedUser = await updateMe(data);
      setUser(updatedUser);
      router.push("/profile");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update profile");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main className={css.mainContent}>
      <h1 className={css.formTitle}>Edit profile</h1>

      <form className={css.form} action={handleSubmit}>
        <div className={css.formGroup}>
          <label htmlFor="avatar">Avatar</label>
          <div className={css.avatarWrapper}>
            <Image
              src={avatar || "/user-defaul-photo.webp"}
              alt="User avatar"
              width={120}
              height={120}
              className={css.avatar}
            />
          </div>
        </div>

        <div className={css.formGroup}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
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
            readOnly
            className={css.input}
          />
        </div>

        <div className={css.actions}>
          <button
            type="button"
            onClick={handleCancel}
            className={css.cancelButton}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={css.submitButton}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

      {error && <p className={css.error}>{error}</p>}
    </main>
  );
}