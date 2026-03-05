import axios from "axios";

const appOrigin = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const baseURL = typeof window === "undefined" ? `${appOrigin}/api` : "/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});
