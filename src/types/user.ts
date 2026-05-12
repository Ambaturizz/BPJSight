export type UserRole = "patient" | "hospital";

/**
 * Backward compatibility untuk file lama yang masih mengimpor Role.
 */
export type Role = UserRole;

export interface Patient {
  id: string;
  name: string;
  nik: string;
  bpjsNumber: string;
  bpjsClass: string;
}

export interface Hospital {
  id: string;
  name: string;
  code: string;
  city: string;
  type: "Rumah Sakit" | "Klinik" | "Lab";
}

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  displayName: string;
  /**
   * Selalu berisi versi masking, bukan NIK/kode faskes asli.
   */
  identifierMasked: string;
  /**
   * Backward compatibility untuk kode lama. Nilainya juga sudah di-mask.
   */
  identifier: string;
  bpjsMasked?: string;
  emailMasked?: string;
  loginAt: number;
  sessionId: string;
}


