import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin, Navigation, Clock, Star, Phone, ExternalLink,
  Hospital, Stethoscope, Pill, ShieldCheck, Loader2, AlertCircle, Search, Crosshair,
} from "lucide-react";

type FacilityType = "klinik" | "rumah_sakit" | "apotek" | "faskes_bpjs";
type FilterKey = "nearest" | "rating" | "bpjs" | "emergency" | "h24";

interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  lat: number;
  lng: number;
  address: string;
  rating: number;
  bpjs: boolean;
  emergency: boolean;
  open24h: boolean;
  phone: string;
  openNow: boolean;
}

// Default center: Jakarta (Monas) — used as fallback if geolocation denied
const DEFAULT_LOCATION = { lat: -6.1754, lng: 106.8272 };

const FACILITIES: Facility[] = [
  { id: "1", name: "RS MBG Pusat", type: "rumah_sakit", lat: -6.1820, lng: 106.8290, address: "Jl. Merdeka Utara No. 1, Jakarta Pusat", rating: 4.8, bpjs: true, emergency: true, open24h: true, phone: "021-3500-100", openNow: true },
  { id: "2", name: "Klinik Sehat Sentosa", type: "klinik", lat: -6.1700, lng: 106.8200, address: "Jl. Thamrin No. 45, Jakarta Pusat", rating: 4.5, bpjs: true, emergency: false, open24h: false, phone: "021-3100-220", openNow: true },
  { id: "3", name: "Apotek Kimia Farma", type: "apotek", lat: -6.1780, lng: 106.8250, address: "Jl. Sudirman Kav. 21, Jakarta Pusat", rating: 4.3, bpjs: false, emergency: false, open24h: true, phone: "021-2900-440", openNow: true },
  { id: "4", name: "Puskesmas Menteng", type: "faskes_bpjs", lat: -6.1900, lng: 106.8350, address: "Jl. Cikini Raya No. 12, Menteng", rating: 4.2, bpjs: true, emergency: false, open24h: false, phone: "021-3155-600", openNow: false },
  { id: "5", name: "RS Cipto Mangunkusumo", type: "rumah_sakit", lat: -6.1985, lng: 106.8410, address: "Jl. Diponegoro No. 71, Jakarta Pusat", rating: 4.7, bpjs: true, emergency: true, open24h: true, phone: "021-3147-900", openNow: true },
  { id: "6", name: "Klinik Mitra Keluarga", type: "klinik", lat: -6.1650, lng: 106.8150, address: "Jl. Kebon Sirih No. 30, Jakarta Pusat", rating: 4.4, bpjs: true, emergency: true, open24h: false, phone: "021-3920-110", openNow: true },
  { id: "7", name: "Apotek Guardian", type: "apotek", lat: -6.1740, lng: 106.8300, address: "Plaza Indonesia Lt. 1, Jakarta Pusat", rating: 4.1, bpjs: false, emergency: false, open24h: false, phone: "021-2992-330", openNow: true },
  { id: "8", name: "Puskesmas Kebon Jeruk", type: "faskes_bpjs", lat: -6.1880, lng: 106.7700, address: "Jl. Kebon Jeruk Raya, Jakarta Barat", rating: 4.0, bpjs: true, emergency: false, open24h: false, phone: "021-5366-110", openNow: true },
  { id: "9", name: "RS Pondok Indah", type: "rumah_sakit", lat: -6.2650, lng: 106.7850, address: "Jl. Metro Duta Kav. UE, Pondok Indah", rating: 4.9, bpjs: true, emergency: true, open24h: true, phone: "021-7657-525", openNow: true },
  { id: "10", name: "Apotek Century", type: "apotek", lat: -6.1760, lng: 106.8230, address: "Grand Indonesia Mall, Jakarta Pusat", rating: 4.2, bpjs: true, emergency: false, open24h: true, phone: "021-2358-110", openNow: true },
];

const TYPE_META: Record<FacilityType, { label: string; icon: typeof Hospital; color: string }> = {
  rumah_sakit: { label: "Rumah Sakit", icon: Hospital, color: "text-destructive" },
  klinik: { label: "Klinik", icon: Stethoscope, color: "text-info" },
  apotek: { label: "Apotek", icon: Pill, color: "text-success" },
  faskes_bpjs: { label: "Faskes BPJS", icon: ShieldCheck, color: "text-primary" },
};

// Haversine distance in km
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

const NearbyFacilities = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locStatus, setLocStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [filter, setFilter] = useState<FilterKey>("nearest");
  const [typeFilter, setTypeFilter] = useState<FacilityType | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocStatus("error");
      setCoords(DEFAULT_LOCATION);
      return;
    }
    setLocStatus("loading");
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus("ok");
      },
      () => {
        setLocStatus("error");
        setCoords(DEFAULT_LOCATION);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 8000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  };

  const center = coords ?? DEFAULT_LOCATION;

  const enriched = useMemo(() => {
    return FACILITIES.map((f) => {
      const km = distanceKm(center, { lat: f.lat, lng: f.lng });
      const eta = Math.max(2, Math.round((km / 25) * 60)); // ~25km/h avg urban
      return { ...f, km, eta };
    });
  }, [center]);

  const filtered = useMemo(() => {
    let list = enriched;
    if (typeFilter !== "all") list = list.filter((f) => f.type === typeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q) || f.address.toLowerCase().includes(q));
    }
    if (filter === "bpjs") list = list.filter((f) => f.bpjs);
    if (filter === "emergency") list = list.filter((f) => f.emergency);
    if (filter === "h24") list = list.filter((f) => f.open24h);
    if (filter === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    else list = [...list].sort((a, b) => a.km - b.km);
    return list;
  }, [enriched, filter, typeFilter, query]);

  const mapUrl = `https://www.google.com/maps?q=${center.lat},${center.lng}&hl=id&z=14&output=embed`;

  return (
    <div className="space-y-5">
      {/* Location bar */}
      <Card className="p-4 md:p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-md shadow-primary/30">
              {locStatus === "loading" ? (
                <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
              ) : (
                <Crosshair className="h-4 w-4 text-primary-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {locStatus === "loading" && "Mendeteksi lokasi…"}
                {locStatus === "ok" && "Lokasi real-time aktif"}
                {locStatus === "error" && "Lokasi default (Jakarta Pusat)"}
                {locStatus === "idle" && "Aktifkan lokasi"}
              </p>
              <p className="text-xs text-muted-foreground">
                {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                {locStatus === "error" && " • Izin lokasi ditolak"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={requestLocation} className="rounded-lg">
            <Navigation className="h-4 w-4" /> Perbarui Lokasi
          </Button>
        </div>
      </Card>

      {/* Map */}
      <Card className="overflow-hidden border-border/60" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="relative aspect-[16/9] w-full bg-muted">
          <iframe
            title="Peta Faskes Terdekat"
            src={mapUrl}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border/40" />
        </div>
      </Card>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau alamat faskes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {([
            { k: "all" as const, label: "Semua" },
            { k: "rumah_sakit" as const, label: "Rumah Sakit" },
            { k: "klinik" as const, label: "Klinik" },
            { k: "apotek" as const, label: "Apotek" },
            { k: "faskes_bpjs" as const, label: "Faskes BPJS" },
          ]).map((t) => (
            <button
              key={t.k}
              onClick={() => setTypeFilter(t.k)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                typeFilter === t.k
                  ? "gradient-primary border-transparent text-primary-foreground shadow-md shadow-primary/25"
                  : "border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {([
            { k: "nearest" as FilterKey, label: "Terdekat", icon: MapPin },
            { k: "rating" as FilterKey, label: "Rating Terbaik", icon: Star },
            { k: "bpjs" as FilterKey, label: "BPJS Tersedia", icon: ShieldCheck },
            { k: "emergency" as FilterKey, label: "IGD", icon: AlertCircle },
            { k: "h24" as FilterKey, label: "24 Jam", icon: Clock },
          ]).map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === f.k
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.length === 0 && (
          <Card className="md:col-span-2 p-8 text-center text-sm text-muted-foreground">
            Tidak ada faskes yang cocok dengan filter.
          </Card>
        )}
        {filtered.map((f, idx) => {
          const meta = TYPE_META[f.type];
          const Icon = meta.icon;
          const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}&travelmode=driving`;
          return (
            <Card
              key={f.id}
              className="animate-slide-up p-4 md:p-5 border-border/60 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/20"
              style={{ animationDelay: `${idx * 0.05}s`, boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/60 ${meta.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-foreground truncate">{f.name}</h4>
                    <Badge className="bg-muted/60 text-muted-foreground border border-border/60 text-[10px] font-semibold">
                      {meta.label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{f.address}</p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      <MapPin className="h-3 w-3" /> {f.km.toFixed(2)} km
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" /> ±{f.eta} mnt
                    </span>
                    <span className="inline-flex items-center gap-1 text-warning">
                      <Star className="h-3 w-3 fill-warning" /> {f.rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {f.bpjs && (
                      <Badge className="bg-primary/15 text-primary border border-primary/25 text-[10px] font-semibold">
                        <ShieldCheck className="mr-1 h-3 w-3" /> BPJS
                      </Badge>
                    )}
                    {f.emergency && (
                      <Badge className="bg-destructive/15 text-destructive border border-destructive/25 text-[10px] font-semibold">
                        IGD
                      </Badge>
                    )}
                    {f.open24h && (
                      <Badge className="bg-info/15 text-info border border-info/25 text-[10px] font-semibold">
                        24 Jam
                      </Badge>
                    )}
                    <Badge className={`text-[10px] font-semibold border ${
                      f.openNow
                        ? "bg-success/15 text-success border-success/25"
                        : "bg-muted text-muted-foreground border-border/60"
                    }`}>
                      <span className={`mr-1 h-1.5 w-1.5 rounded-full ${f.openNow ? "bg-success" : "bg-muted-foreground"}`} />
                      {f.openNow ? "Buka" : "Tutup"}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" className="h-8 rounded-lg text-xs gradient-primary text-primary-foreground">
                      <a href={gmaps} target="_blank" rel="noreferrer">
                        <Navigation className="h-3.5 w-3.5" /> Google Maps
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="h-8 rounded-lg text-xs">
                      <a href={`tel:${f.phone}`}>
                        <Phone className="h-3.5 w-3.5" /> Telepon
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default NearbyFacilities;
