import type { AuthUser } from "@/types/user";

const STORAGE_KEY = "bpjsight.prototype.session";
const MOCK_DELAY_MS = 700;

export interface PatientLoginPayload {
  nik: string;
  bpjs: string;
  password: string;
}

export interface PatientRegisterPayload extends PatientLoginPayload {
  name: string;
}

export interface HospitalLoginPayload {
  faskes: string;
  email: string;
  password: string;
}

export interface HospitalRegisterPayload extends HospitalLoginPayload {
  hospitalName: string;
  npwp: string;
}

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthServiceError";
  }
}

function delay<T>(data: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), ms);
  });
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function maskIdentity(value: string, visibleStart = 0, visibleEnd = 4): string {
  const clean = value.trim();

  if (!clean) return "";
  if (clean.length <= visibleStart + visibleEnd) {
    return "•".repeat(clean.length);
  }

  const start = visibleStart > 0 ? clean.slice(0, visibleStart) : "";
  const end = visibleEnd > 0 ? clean.slice(-visibleEnd) : "";
  const maskedLength = clean.length - start.length - end.length;
  const masked = "•".repeat(Math.max(maskedLength, 0));

  return `${start}${masked}${end}`.replace(/(.{4})/g, "$1 ").trim();
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.trim().toLowerCase().split("@");

  if (!localPart || !domain) return "Email tersembunyi";

  const visible = localPart.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(localPart.length - 2, 3))}@${domain}`;
}

function assertPasswordAccepted(password: string): void {
  const rejectedValues = new Set(["password", "password123", "12345678", "qwerty123", "wrongpass"]);

  if (rejectedValues.has(password.trim().toLowerCase())) {
    throw new AuthServiceError("Password terlalu umum untuk simulasi autentikasi. Gunakan password demo lain minimal 8 karakter.");
  }

  if (password.trim().toLowerCase().includes("gagal")) {
    throw new AuthServiceError("Simulasi login gagal. Periksa kembali kredensial Anda.");
  }
}

function saveSession(user: AuthUser): void {
  // Prototype: simpan sesi sementara saja dan tidak menyimpan NIK/BPJS/NPWP/password penuh.
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
  // Bersihkan key lama jika project sebelumnya pernah memakai nama ini.
  localStorage.removeItem("bpjsight.session");
  sessionStorage.removeItem("bpjsight.session");
}

function readSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed || !parsed.role || !parsed.sessionId) return null;

    return parsed;
  } catch {
    clearSession();
    return null;
  }
}

function buildPatientUser(payload: PatientLoginPayload | PatientRegisterPayload): AuthUser {
  assertPasswordAccepted(payload.password);

  const nik = normalizeDigits(payload.nik);
  const bpjs = normalizeDigits(payload.bpjs);
  const displayName = "name" in payload && payload.name.trim() ? payload.name.trim() : "Pasien BPJS";
  const identifierMasked = maskIdentity(nik);

  return {
    id: `patient-${nik.slice(-4)}`,
    role: "patient",
    name: displayName,
    displayName,
    identifierMasked,
    identifier: identifierMasked,
    bpjsMasked: maskIdentity(bpjs),
    loginAt: Date.now(),
    sessionId: createSessionId(),
  };
}

function buildHospitalUser(payload: HospitalLoginPayload | HospitalRegisterPayload): AuthUser {
  assertPasswordAccepted(payload.password);

  const faskes = payload.faskes.trim().toUpperCase();
  const displayName = "hospitalName" in payload && payload.hospitalName.trim() ? payload.hospitalName.trim() : "Admin Rumah Sakit";
  const identifierMasked = maskIdentity(faskes, Math.min(2, faskes.length), Math.min(2, faskes.length));

  return {
    id: `hospital-${faskes.slice(-4)}`,
    role: "hospital",
    name: displayName,
    displayName,
    identifierMasked,
    identifier: identifierMasked,
    emailMasked: maskEmail(payload.email),
    loginAt: Date.now(),
    sessionId: createSessionId(),
  };
}

async function loginPatient(payload: PatientLoginPayload): Promise<AuthUser> {
  const user = buildPatientUser(payload);
  saveSession(user);
  return delay(user);
}

async function registerPatient(payload: PatientRegisterPayload): Promise<AuthUser> {
  const user = buildPatientUser(payload);
  saveSession(user);
  return delay(user);
}

async function loginHospital(payload: HospitalLoginPayload): Promise<AuthUser> {
  const user = buildHospitalUser(payload);
  saveSession(user);
  return delay(user);
}

async function registerHospital(payload: HospitalRegisterPayload): Promise<AuthUser> {
  const user = buildHospitalUser(payload);
  saveSession(user);
  return delay(user);
}

async function logout(): Promise<void> {
  clearSession();
  return delay(undefined, 250);
}

async function getCurrentUser(): Promise<AuthUser | null> {
  return delay(readSession(), 250);
}

export const authService = {
  loginPatient,
  registerPatient,
  loginHospital,
  registerHospital,
  logout,
  getCurrentUser,
  maskIdentity,
};


