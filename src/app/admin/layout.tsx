import "../css/admin.css";
import { AuthGate } from "@/components/Admin/AuthGate";
import { Shell } from "@/components/Admin/Shell";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "rb-admin",
  description: "Admin portal",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background antialiased">
        <AuthGate>
          <Shell>{children}</Shell>
        </AuthGate>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
