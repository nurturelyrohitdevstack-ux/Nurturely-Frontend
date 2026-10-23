import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import AuthProvider from "@/app/Components/AuthProvider";
import { Toaster } from "sonner";

export const metadata = {
  title: "Nurturely | Lead Management & Sales CRM",
  description:
    "Maintainable, modern Lead Management System and Sales Pipeline CRM for web development, SEO, and B2B services.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#D6451B",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-orange-100 selection:text-[#D6451B]">
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
              "!rounded-2xl !border !border-orange-100 !bg-white !text-slate-800 !shadow-xl !font-sans",
          }}
        />
      </body>
    </html>
  );
}
