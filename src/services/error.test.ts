import { describe, it, expect } from "vitest";
import { getErrorMessage } from "./error";

describe("getErrorMessage", () => {
  it("returns fallback for unknown non-error", () => {
    expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
  });

  it("extracts message from Error instance", () => {
    const err = new Error("oh no");
    expect(getErrorMessage(err)).toBe("oh no");
  });

  it("handles axios-like error shape with response.data.message", () => {
    const axiosErr = { isAxiosError: true, response: { data: { message: "bad" } } };
    expect(getErrorMessage(axiosErr)).toBe("bad");
  });
});
