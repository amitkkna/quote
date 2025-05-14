import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Performa Invoice System",
  description: "Generate Performa Invoices and Quotations with customizable layouts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-gray-100">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Performa Invoice System
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          <footer className="bg-white shadow mt-auto py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Global Digital Connect. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
