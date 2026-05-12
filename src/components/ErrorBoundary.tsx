import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/feedback/EmptyState";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Simpan minimal ke sessionStorage untuk kebutuhan debugging demo tanpa membocorkan data pengguna.
    try {
      sessionStorage.setItem(
        "bpjsight.last_ui_error",
        JSON.stringify({ message: error.message, componentStack: info.componentStack, at: new Date().toISOString() }),
      );
    } catch {
      // Abaikan jika storage tidak tersedia.
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
          <EmptyState
            title="Terjadi kendala pada tampilan"
            description="Aplikasi tidak dapat menampilkan halaman ini untuk sementara. Coba muat ulang tampilan atau kembali ke halaman sebelumnya."
            icon={<AlertTriangle className="h-7 w-7 text-destructive" aria-hidden="true" />}
            action={
              <Button type="button" onClick={this.handleReset} className="rounded-xl gradient-primary text-primary-foreground">
                <RefreshCw className="h-4 w-4" aria-hidden="true" /> Coba Lagi
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}


