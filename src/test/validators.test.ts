import { describe, it, expect } from "vitest";
import { nikSchema, bpjsSchema, faskesCodeSchema, npwpSchema, passwordSchema } from "@/lib/validators";

describe("validators", () => {
  it("accepts a valid 16-digit NIK", () => {
    expect(nikSchema.safeParse("3275010101010001").success).toBe(true);
  });
  it("rejects NIK with letters or wrong length", () => {
    expect(nikSchema.safeParse("32750101A1010001").success).toBe(false);
    expect(nikSchema.safeParse("123").success).toBe(false);
  });
  it("validates BPJS as 13 digits", () => {
    expect(bpjsSchema.safeParse("0001234567890").success).toBe(true);
    expect(bpjsSchema.safeParse("123").success).toBe(false);
  });
  it("validates faskes code 4-12 alphanumeric", () => {
    expect(faskesCodeSchema.safeParse("RSp0l1s1MBG").success).toBe(true);
    expect(faskesCodeSchema.safeParse("RS-1").success).toBe(false);
  });
  it("validates NPWP 15 or 16 digits", () => {
    expect(npwpSchema.safeParse("123456789012345").success).toBe(true);
    expect(npwpSchema.safeParse("1234567890").success).toBe(false);
  });
  it("password requires letter + digit and min 8", () => {
    expect(passwordSchema.safeParse("abcdefg1").success).toBe(true);
    expect(passwordSchema.safeParse("alllowercase").success).toBe(false);
    expect(passwordSchema.safeParse("12345678").success).toBe(false);
  });
});


