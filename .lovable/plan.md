# Rencana Refactor BPJSight

## 1. Ringkasan Masalah Teknis

| # | Area | Masalah | Dampak |
|---|------|---------|--------|
| 1 | Routing | `Index.tsx` pakai `useState<View>` sebagai router. Tidak bisa share URL, no back/forward, no deep link, no SEO. | Tinggi |
| 2 | Auth | `PatientLogin`/`HospitalLogin` langsung `writeSession` tanpa validasi kredensial. Tidak ada provider, tidak ada role check terpusat. | Tinggi |
| 3 | Data | Klaim, pasien, faskes, notifikasi di-hardcode di komponen (`HospitalDashboard`, `PatientDashboard`, `NearbyFacilities`, dll). Tidak reusable, sulit ditest. | Tinggi |
| 4 | Tombol mati | Beberapa CTA (Detail klaim, Export, Filter lanjutan, Lihat semua notifikasi) belum ada handler. | Sedang |
| 5 | AI Risk Score | Skor muncul tanpa breakdown faktor, sumber data, atau confidence interval. Tidak kredibel untuk konteks medis. | Sedang |
| 6 | Detail klaim | Tidak ada halaman/drawer detail (timeline, dokumen, FHIR payload, log audit). | Tinggi |
| 7 | Search/Filter | Tabel klaim tidak punya search by nama/nomor, filter status, range tanggal, sort. | Sedang |
| 8 | Validasi form | NIK/BPJS hanya dibatasi panjang via `slice`. Tidak ada schema validation, tidak ada error message per-field. | Sedang |
| 9 | Protected route | Hanya cek di `useEffect` dalam `Index.tsx`. Mudah bocor saat refresh, tidak konsisten per-role. | Tinggi |
| 10 | Test | Hanya `example.test.ts`. Tidak ada coverage untuk auth, validation, util, atau komponen kritis. | Sedang |

## 2. Prioritas Pengerjaan

**Fase 1 — Fondasi (blocking)**
1. URL routing dengan React Router (nested + role-based).
2. `AuthProvider` + `ProtectedRoute` + `RoleGuard`.
3. Skema validasi terpusat (Zod) untuk NIK, BPJS, faskes code, NPWP, email, password.

**Fase 2 — Data Layer**
4. Pindahkan semua dummy data ke `src/data/` + tipe domain di `src/types/`.
5. Buat hooks `useClaims`, `usePatients`, `useFacilities`, `useNotifications` pakai `@tanstack/react-query` (queryFn membaca mock service — siap diganti API nanti).

**Fase 3 — UX Klaim**
6. Halaman `ClaimDetail` (route `/rs/klaim/:claimId`) dengan tab: Ringkasan, Dokumen (10 PDF), FHIR Bundle, Audit Log, AI Risk.
7. Toolbar `ClaimsTable`: search, filter status, date range, sort, pagination, export CSV.
8. AI Risk Explainer: breakdown faktor (kelengkapan dokumen, kesesuaian INA-CBG, riwayat denial DPJP, anomali biaya), confidence %, sumber, disclaimer.

**Fase 4 — Polish & QA**
9. Form refactor pakai `react-hook-form` + `zodResolver`, error inline, disable submit saat invalid.
10. Test: unit (validators, formatters, risk scorer), component (LoginForm, ClaimsTable filter), integration (ProtectedRoute redirect).

## 3. Struktur Folder Baru

```text
src/
  app/
    router.tsx              # createBrowserRouter, semua route
    providers.tsx           # QueryClient, Tooltip, Toaster, AuthProvider
  routes/
    landing/                # Beranda, Tentang, Fitur, EHR
    auth/
      PatientLoginRoute.tsx
      HospitalLoginRoute.tsx
    patient/
      DashboardRoute.tsx
      NearbyRoute.tsx
      ProfileRoute.tsx
    hospital/
      DashboardRoute.tsx
      ClaimsListRoute.tsx
      ClaimDetailRoute.tsx
      SubmitClaimRoute.tsx
      ProfileRoute.tsx
    NotFound.tsx
  features/
    auth/
      AuthProvider.tsx
      ProtectedRoute.tsx
      RoleGuard.tsx
      useAuth.ts
    claims/
      components/ClaimsTable.tsx, ClaimsToolbar.tsx, ClaimStatusBadge.tsx,
                 ClaimDetailTabs.tsx, ClaimDocumentsList.tsx, ClaimFhirView.tsx,
                 ClaimAuditLog.tsx, ClaimRiskExplainer.tsx
      hooks/useClaims.ts, useClaim.ts, useClaimFilters.ts
      utils/exportCsv.ts
    risk/
      scoring.ts            # deterministic scorer + factor breakdown
      RiskGauge.tsx
    notifications/          # pindah dari components/
    facilities/             # pindah NearbyFacilities ke sini
  data/
    claims.mock.ts
    patients.mock.ts
    facilities.mock.ts
    notifications.mock.ts
    fhir.samples.ts
  types/
    claim.ts, patient.ts, facility.ts, user.ts, fhir.ts
  lib/
    validators.ts           # zod schemas: nik, bpjs, faskes, npwp
    formatters.ts           # idr, date, masked id
    queryClient.ts
    storage.ts              # wrapper localStorage/sessionStorage
  components/ui/            # shadcn (tetap)
  hooks/                    # use-mobile, use-toast (tetap)
  test/
    setup.ts
    validators.test.ts
    risk-scoring.test.ts
    ClaimsToolbar.test.tsx
    ProtectedRoute.test.tsx
```

## 4. Daftar File yang Dibuat / Diubah

### Dibuat
- `src/app/router.tsx`, `src/app/providers.tsx`
- `src/features/auth/{AuthProvider,ProtectedRoute,RoleGuard,useAuth}.tsx`
- `src/features/claims/components/*` (8 komponen di atas)
- `src/features/claims/hooks/{useClaims,useClaim,useClaimFilters}.ts`
- `src/features/claims/utils/exportCsv.ts`
- `src/features/risk/{scoring.ts,RiskGauge.tsx}`
- `src/data/{claims,patients,facilities,notifications,fhir.samples}.mock.ts`
- `src/types/{claim,patient,facility,user,fhir}.ts`
- `src/lib/{validators,formatters,storage,queryClient}.ts`
- `src/routes/**` (semua route wrapper di atas)
- `src/test/{validators,risk-scoring,ClaimsToolbar,ProtectedRoute}.test.{ts,tsx}`

### Diubah
- `src/App.tsx` → pakai `RouterProvider` dari `app/router.tsx`.
- `src/pages/Index.tsx` → dihapus (digantikan route landing) atau diubah jadi redirect.
- `src/components/PatientLogin.tsx`, `HospitalLogin.tsx` → pindah ke `routes/auth`, gunakan `react-hook-form` + Zod, panggil `auth.signIn`.
- `src/components/HospitalDashboard.tsx`, `PatientDashboard.tsx` → konsumsi hooks `useClaims`/`usePatient`, hapus dummy inline, tombol Detail navigasi ke `/rs/klaim/:id`.
- `src/components/SmartClaimSubmission.tsx` → submit via `useSubmitClaim` mutation, validasi 10 PDF dengan Zod (tipe & ukuran).
- `src/components/LandingHero.tsx`, `AboutPage.tsx`, `FeaturesPage.tsx`, `EHRPartners.tsx` → ganti `onNavPage` prop dengan `<Link>`/`useNavigate`.
- `src/components/NotificationCenter.tsx`, `NearbyFacilities.tsx` → pindah ke `features/`, baca dari hooks.
- `src/hooks/useSession.ts` → di-wrap `AuthProvider`; tetap simpan inactivity timer.
- `src/components/LogoutButton.tsx` → panggil `auth.signOut()` lalu `navigate('/')`.

### Dihapus
- Prop drilling `onBack`, `onNavigate`, `onNavPage`, `onOpenEHR`, `onSubmitClaim`, `onSuccess` (digantikan routing).

## 5. Detail Teknis Penting

- **Routing**: `createBrowserRouter` + `RouterProvider`. Public: `/`, `/tentang`, `/fitur`, `/ehr`, `/login/pasien`, `/login/rs`. Protected pasien: `/pasien/*`. Protected RS: `/rs/*`. Catch-all: `NotFound`.
- **Auth**: `AuthProvider` ekspos `{ user, signIn(role, creds), signOut, status }`. `ProtectedRoute` cek `user`, redirect ke login dengan `state.from` agar bisa kembali. `RoleGuard` tolak role salah.
- **Validasi (Zod)**:
  - NIK: 16 digit numerik, checksum opsional.
  - BPJS: 13 digit numerik, prefix valid.
  - Faskes: regex alfanumerik 4–10.
  - NPWP: 15/16 digit dengan format.
  - Password: min 8, ada angka & huruf.
- **AI Risk Explainer**: fungsi murni `scoreClaim(claim)` mengembalikan `{ score, level, factors:[{label, weight, value, contribution}], confidence, version }`. Komponen `RiskGauge` + `FactorsTable` + tooltip sumber + disclaimer "bukan keputusan medis final".
- **ClaimsToolbar**: state filter via URL search params (`?q=&status=&from=&to=&sort=`) supaya shareable; `useClaimFilters` baca/tulis params.
- **Detail klaim**: tab Dokumen menampilkan 10 PDF dengan status verifikasi per item; tab FHIR menampilkan `Bundle` JSON dari `data/fhir.samples.ts` dengan syntax highlight ringan.
- **Tests** (Vitest + RTL): validator schemas, `scoreClaim` deterministik, ClaimsToolbar memfilter dataset mock, ProtectedRoute redirect saat tidak ada user.

## 6. Yang TIDAK Diubah
- Tema dark + teal, glassmorphism, token di `index.css` & `tailwind.config.ts`.
- Komponen `components/ui/*` (shadcn).
- Stack: React 18, Vite, Tailwind, shadcn/ui, lucide-react, react-router-dom, @tanstack/react-query.
- Branding `BPJSight`, nama dummy (Polisi MBG, RS MBG, 10 nama pasien).

Setujui rencana ini atau beri masukan (mis. ubah prioritas, skip fase tertentu, atau tambahkan integrasi nyata) sebelum saya mulai implementasi.