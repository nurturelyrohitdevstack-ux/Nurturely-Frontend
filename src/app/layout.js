import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import AuthProvider from "@/app/Components/AuthProvider";
import { Toaster } from "sonner";

export const metadata = {
  title: "Nurturely | Lead Management & Sales CRM",
  description:
    "Maintainable, modern Lead Management System and Sales Pipeline CRM for web development, SEO, and B2B services.",
  icons: {
    icon: "/icon1.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#059669",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-800">
        <ReactQueryProvider>
          <AuthProvider>
            <div className="flex-1 w-full">{children}</div>
          </AuthProvider>
        </ReactQueryProvider>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          expand
          duration={3500}
          toastOptions={{
            className:
              "!rounded-2xl !border !border-emerald-100 !bg-white !text-slate-800 !shadow-xl !font-sans",
          }}
        />
      </body>
    </html>
  );
}
