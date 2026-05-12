import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { FileUp, UploadCloud, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ACCEPTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

interface DocumentUploadProps {
  label: string;
  documentKey: string;
  onUpload: (file: File) => void;
  compact?: boolean;
}

function isAllowedFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return ACCEPTED_MIME_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
}

export default function DocumentUpload({ label, documentKey, onUpload, compact = false }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!isAllowedFile(file)) {
      setError("Format file harus PDF, JPG, atau PNG.");
      toast.error("Format dokumen tidak didukung. Gunakan PDF, JPG, atau PNG.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("Ukuran file maksimal 5MB.");
      toast.error("Ukuran dokumen terlalu besar. Maksimal 5MB.");
      return;
    }

    setError(null);
    onUpload(file);
  };

  return (
    <div className={compact ? "space-y-2" : "rounded-2xl border border-dashed border-primary/35 bg-primary/5 p-4"}>
      <input
        ref={inputRef}
        id={`upload-${documentKey}`}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="sr-only"
        onChange={handleSelectFile}
      />

      <Button
        type="button"
        variant={compact ? "outline" : "default"}
        size={compact ? "sm" : "default"}
        onClick={() => inputRef.current?.click()}
        aria-label={`Upload dokumen ${label}`}
        className={compact ? "w-full rounded-xl" : "w-full rounded-xl"}
      >
        {compact ? <FileUp className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
        Upload Dokumen
      </Button>

      {!compact && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Format PDF, JPG, atau PNG. Maksimal 5MB.
        </p>
      )}

      {error && (
        <div className="mt-2 flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}


