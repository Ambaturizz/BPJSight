export type Role = "patient" | "hospital";

export interface AuthUser {
  role: Role;
  name: string;
  /** For patient: NIK; for hospital: faskes code */
  identifier: string;
  loginAt: number;
  remember: boolean;
}
