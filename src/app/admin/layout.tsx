import "../css/admin.css";
import { Inter } from "next/font/google";
import { AuthGate } from "@/components/Admin/AuthGate";
import { Shell } from "@/components/Admin/Shell";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="bg-background antialiased font-sans">
        <AuthGate>
          <Shell>{children}</Shell>
        </AuthGate>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
