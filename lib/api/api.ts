import axios from "axios";

const origin =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const baseURL = typeof window === "undefined" ? `${origin}/api` : "/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});
