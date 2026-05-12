import { z } from "zod";

export const nikSchema = z
  .string()
  .trim()
  .regex(/^\d{16}$/, "NIK wajib 16 digit angka");

export const bpjsSchema = z
  .string()
  .trim()
  .regex(/^\d{13}$/, "Nomor BPJS wajib 13 digit angka");

export const faskesCodeSchema = z
  .string()
  .trim()
  .min(1, "Kode faskes wajib diisi")
  .regex(/^[A-Za-z0-9]{4,12}$/, "Kode faskes wajib 4–12 karakter alfanumerik tanpa simbol");

export const npwpSchema = z
  .string()
  .trim()
  .regex(/^\d{15,16}$/, "NPWP wajib 15–16 digit angka");

export const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Za-z]/, "Password wajib memuat minimal 1 huruf")
  .regex(/\d/, "Password wajib memuat minimal 1 angka");

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email wajib diisi")
  .email("Email tidak valid")
  .max(255, "Email maksimal 255 karakter");

export const patientLoginSchema = z.object({
  nik: nikSchema,
  bpjs: bpjsSchema,
  password: passwordSchema,
});

export const patientRegisterSchema = patientLoginSchema.extend({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
});

export const hospitalLoginSchema = z.object({
  faskes: faskesCodeSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const hospitalRegisterSchema = hospitalLoginSchema.extend({
  hospitalName: z.string().trim().min(1, "Nama RS wajib diisi").max(120, "Nama RS maksimal 120 karakter"),
  npwp: npwpSchema,
});

export type PatientLoginInput = z.infer<typeof patientLoginSchema>;
export type PatientRegisterInput = z.infer<typeof patientRegisterSchema>;
export type HospitalLoginInput = z.infer<typeof hospitalLoginSchema>;
export type HospitalRegisterInput = z.infer<typeof hospitalRegisterSchema>;
