import { z } from "zod";

export const nikSchema = z
  .string()
  .regex(/^\d{16}$/, "NIK harus 16 digit angka");

export const bpjsSchema = z
  .string()
  .regex(/^\d{13}$/, "Nomor BPJS harus 13 digit angka");

export const faskesCodeSchema = z
  .string()
  .regex(/^[A-Za-z0-9]{4,12}$/, "Kode faskes 4–12 karakter alfanumerik");

export const npwpSchema = z
  .string()
  .regex(/^\d{15,16}$/, "NPWP harus 15–16 digit angka");

export const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Za-z]/, "Harus ada huruf")
  .regex(/\d/, "Harus ada angka");

export const emailSchema = z
  .string()
  .trim()
  .email("Email tidak valid")
  .max(255);

export const patientLoginSchema = z.object({
  nik: nikSchema,
  bpjs: bpjsSchema,
  password: passwordSchema,
  remember: z.boolean().default(true),
});

export const patientRegisterSchema = patientLoginSchema.extend({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
});

export const hospitalLoginSchema = z.object({
  faskes: faskesCodeSchema,
  email: emailSchema,
  password: passwordSchema,
  remember: z.boolean().default(true),
});

export const hospitalRegisterSchema = hospitalLoginSchema.extend({
  hospitalName: z.string().trim().min(3, "Nama RS minimal 3 karakter").max(120),
  npwp: npwpSchema,
});

export type PatientLoginInput = z.infer<typeof patientLoginSchema>;
export type PatientRegisterInput = z.infer<typeof patientRegisterSchema>;
export type HospitalLoginInput = z.infer<typeof hospitalLoginSchema>;
export type HospitalRegisterInput = z.infer<typeof hospitalRegisterSchema>;
