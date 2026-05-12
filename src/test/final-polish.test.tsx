import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LandingHero from "@/components/LandingHero";
import PatientLoginRoute from "@/routes/auth/PatientLoginRoute";
import HospitalLoginRoute from "@/routes/auth/HospitalLoginRoute";
import PatientDashboard from "@/components/PatientDashboard";
import { applyHospitalClaimFilters } from "@/lib/hospital-claim-filters";
import RiskExplanationPanel from "@/components/ai/RiskExplanationPanel";
import EmptyState from "@/components/feedback/EmptyState";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useAuth } from "@/features/auth/AuthProvider";
import { claimsService } from "@/services/claimsService";
import type { HospitalClaim, PatientClaim } from "@/types/claim";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("@/features/auth/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/services/claimsService", () => ({
  claimsService: {
    getPatientClaims: vi.fn(),
    getHospitalClaims: vi.fn(),
    getBenefits: vi.fn(),
    getDashboardStats: vi.fn(),
  },
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedClaimsService = vi.mocked(claimsService);

function mockPatientSession() {
  mockedUseAuth.mockReturnValue({
    currentUser: {
      id: "patient-0001",
      role: "patient",
      name: "Pasien Demo",
      displayName: "Pasien Demo",
      identifierMasked: "•••• 0001",
      identifier: "•••• 0001",
      bpjsMasked: "•••• 7890",
      loginAt: Date.now(),
      sessionId: "session-patient",
    },
    user: null,
    isAuthenticated: true,
    isLoading: false,
    role: "patient",
    status: "authenticated",
    login: vi.fn(),
    logout: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  } as never);
}

function makePatientClaim(overrides: Partial<PatientClaim> = {}): PatientClaim {
  return {
    id: "KLM-TEST-001",
    title: "Rawat Jalan - Poli Jantung",
    hospital: "RS Demo",
    date: "12 Mei 2026",
    amount: "Rp 1.250.000",
    status: "diproses",
    steps: ["Diajukan", "Diverifikasi", "Diproses", "Selesai"],
    currentStep: 1,
    risk: null,
    riskScore: 25,
    riskLevel: "rendah",
    aiConfidence: 90,
    timeline: [],
    documents: [],
    riskReasons: [],
    recommendations: [],
    riskFactors: [],
    recommendedActions: [],
    ...overrides,
  };
}

function makeHospitalClaim(overrides: Partial<HospitalClaim> = {}): HospitalClaim {
  return {
    id: "RS-KLM-001",
    patient: "Pasien Demo",
    nik: "3275010101010001",
    bpjs: "0001234567890",
    diagnosis: "Demam Berdarah Dengue",
    icd10: "A91",
    amountIDR: 7_500_000,
    submittedAt: "2026-05-10T10:00:00+07:00",
    status: "aman",
    risk: 20,
    riskLevel: "rendah",
    confidence: 90,
    docs: "Lengkap",
    documents: [],
    audit: [],
    fhirBundleId: "FHIR-1",
    dpjp: "dr. Demo",
    riskReasons: [],
    riskFactors: [],
    verifierNotes: [],
    revisionRequests: [],
    recommendedActions: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPatientSession();
  mockedClaimsService.getBenefits.mockResolvedValue([]);
  mockedClaimsService.getDashboardStats.mockResolvedValue([]);
});

describe("final polish stability tests", () => {
  it("LandingHero menampilkan pilihan pasien dan rumah sakit", () => {
    render(<LandingHero onNavigate={vi.fn()} />);

    expect(screen.getByText(/Masuk sebagai Pasien/i)).toBeInTheDocument();
    expect(screen.getByText(/Masuk sebagai Rumah Sakit/i)).toBeInTheDocument();
  });

  it("Login pasien menolak NIK kurang dari 16 digit", async () => {
    render(
      <MemoryRouter>
        <PatientLoginRoute />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText(/16 digit NIK/i), { target: { value: "123" } });
    fireEvent.change(screen.getByPlaceholderText(/13 digit nomor BPJS/i), { target: { value: "0001234567890" } });
    fireEvent.change(screen.getByPlaceholderText(/Minimal 8 karakter/i), { target: { value: "Password1" } });
    fireEvent.click(screen.getByRole("button", { name: /^Masuk$/i }));

    expect(await screen.findByText(/NIK wajib 16 digit angka/i)).toBeInTheDocument();
  });

  it("Login rumah sakit menolak email tidak valid", async () => {
    render(
      <MemoryRouter>
        <HospitalLoginRoute />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText(/Contoh: RS001/i), { target: { value: "RS001" } });
    fireEvent.change(screen.getByPlaceholderText(/admin@rumahsakit.co.id/i), { target: { value: "email-salah" } });
    fireEvent.change(screen.getByPlaceholderText(/Minimal 8 karakter/i), { target: { value: "Password1" } });
    fireEvent.click(screen.getByRole("button", { name: /^Masuk$/i }));

    expect(await screen.findByText(/Email tidak valid/i)).toBeInTheDocument();
  });

  it("ProtectedRoute redirect jika user belum login", async () => {
    mockedUseAuth.mockReturnValue({
      currentUser: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      role: null,
      status: "unauthenticated",
      login: vi.fn(),
      logout: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as never);

    render(
      <MemoryRouter initialEntries={["/pasien/dashboard"]}>
        <Routes>
          <Route path="/login/pasien" element={<p>Login Pasien Tujuan</p>} />
          <Route
            path="/pasien/dashboard"
            element={
              <ProtectedRoute allowedRole="patient">
                <p>Dashboard pasien rahasia</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Login Pasien Tujuan/i)).toBeInTheDocument();
  });

  it("Dashboard pasien menampilkan klaim aktif", async () => {
    mockPatientSession();
    mockedClaimsService.getPatientClaims.mockResolvedValue([
      makePatientClaim({ id: "KLM-AKTIF-001", title: "Klaim Aktif Demo" }),
    ]);

    render(
      <MemoryRouter>
        <PatientDashboard onBack={vi.fn()} />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Klaim Aktif Demo/i)).toBeInTheDocument();
  });

  it("Dashboard rumah sakit dapat filter klaim berisiko", () => {
    const data = [
      makeHospitalClaim({ id: "AMAN-001", patient: "Pasien Aman", status: "aman", risk: 20 }),
      makeHospitalClaim({ id: "RISK-001", patient: "Pasien Berisiko", status: "berisiko", risk: 86 }),
    ];

    const result = applyHospitalClaimFilters(data, {
      query: "",
      riskStatus: "berisiko",
      documentStatus: "all",
      riskMin: 0,
      riskMax: 100,
      sort: "risk_desc",
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("RISK-001");
  });

  it("RiskExplanationPanel menampilkan faktor risiko", () => {
    render(
      <RiskExplanationPanel
        score={78}
        level="tinggi"
        confidence={82}
        riskFactors={["Dokumen resume medis belum lengkap"]}
        recommendedActions={["Lengkapi resume medis"]}
      />,
    );

    expect(screen.getByText(/Dokumen resume medis belum lengkap/i)).toBeInTheDocument();
    expect(screen.getByText(/Lengkapi resume medis/i)).toBeInTheDocument();
  });

  it("Empty state muncul ketika data kosong", () => {
    render(<EmptyState title="Tidak ada data" description="Data belum tersedia untuk ditampilkan." />);

    expect(screen.getByText(/Tidak ada data/i)).toBeInTheDocument();
    expect(screen.getByText(/Data belum tersedia/i)).toBeInTheDocument();
  });
});






