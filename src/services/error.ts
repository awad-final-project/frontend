import type { AxiosError } from "axios";

export function getErrorMessage(err: unknown, fallback = "An error occurred") {
  if (err == null) return fallback;
  // Axios error
  const e = err as AxiosError | any;
  if (e?.isAxiosError) {
    // try common shapes
    const data = e?.response?.data;
    if (data) {
      if (typeof data === "string") return data;
      if (data.message) return String(data.message);
      if (data.error) return String(data.error);
    }
    if (e.message) return e.message;
    return fallback;
  }

  // plain Error
  if (err instanceof Error) return err.message;

  try {
    return JSON.stringify(err);
  } catch {
    return fallback;
  }
}

export default getErrorMessage;
