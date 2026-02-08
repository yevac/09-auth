"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import css from "./EditProfilePage.module.css";

import { useAuthStore } from "@/lib/store/authStore";
import { getMe, updateMe } from "@/lib/api/clientApi";

export default function Edit() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    getMe().then((user) => {
      setUsername(user.username ?? "");
      setEmail(user.email ?? "");
      setAvatar(user.avatar ?? "");
    });
  }, []);

  const handleSaveUser = async (formData: FormData) => {
    const username = (formData.get("username") as string) ?? "";
    const updatedUser = await updateMe({ username });
    setUser(updatedUser);
    router.push("/profile");
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleCancel = () => {
    router.push("/profile");
  };

  return (
    <div className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit profile</h1>
        <Image
          src={avatar || "/user-default-photo.webp"}
          width={300}
          height={300}
          alt="Avatar"
        />
        <p>
          <span style={{ fontWeight: "bold" }}>Email: </span>
          {email}
        </p>
        <form action={handleSaveUser} className={css.form}>
          <input
            type="text"
            name="username" required
            value={username}
            onChange={handleChange}
            className={css.input}
          />

          <button className={css.saveButton} type="submit">
            Save
          </button>
          <button
            onClick={handleCancel}
            type="button"
            className={css.cancelButton}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}