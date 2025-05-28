import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Header } from "@plydojo/plydojo-ui/components/header";
import Link from "next/link";

import "@plydojo/plydojo-ui/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PlyDojo - Interactive Chess Tutoring",
  description: "Learn chess with AI-powered tutoring and interactive gameplay",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigationItems = [
    { href: "/", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
    { href: "/history", label: "History" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Header
              logoComponent={
                <Link href="/" className="text-xl font-semibold">
                  PlyDojo
                </Link>
              }
              navigationItems={navigationItems}
              onLoginClick={() => console.log("Login clicked")}
              onSignUpClick={() => console.log("Sign up clicked")}
            />
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
