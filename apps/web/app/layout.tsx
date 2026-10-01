import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./auth/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestion Scolaire",
  description: "Application de gestion pour collèges et lycées privés",
};

// Client component for navigation bar
"use client";

import { useAuth } from "./auth/provider";
import Link from "next/link";

function NavBar() {
  const { role } = useAuth();

  // Default links for unauthenticated users
  let links = [
    { href: "/login", label: "Connexion" },
  ];

  // If authenticated, show role-based links
  if (role === "admin") {
    links = [
      { href: "/admin/dashboard", label: "Tableau de bord admin" },
      { href: "/admin/classes", label: "Gestion des classes" },
      { href: "/admin/paiements", label: "Suivi des paiements" },
      { href: "/admin/signalements", label: "Signalements" },
      { href: "/admin/bulletins", label: "Bulletins" },
      { href: "/admin/statistiques", label: "Statistiques" },
      { href: "/logout", label: "Déconnexion" },
    ];
  } else if (role === "enseignant") {
    links = [
      { href: "/enseignant/dashboard", label: "Tableau de bord enseignant" },
      { href: "/enseignant/notes", label: "Saisie des notes" },
      { href: "/enseignant/absences", label: "Gestion des absences" },
      { href: "/enseignant/devoirs", label: "Cahier de texte" },
      { href: "/enseignant/emploi-du-temps", label: "Emploi du temps" },
      { href: "/enseignant/moyennes", label: "Moyennes et classements" },
      { href: "/logout", label: "Déconnexion" },
    ];
  }

  return (
    <nav className="bg-white dark:bg-gray-800 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold text-gray-900 dark:text-white">
              Gestion Scolaire
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="flex space-x-4">
              {links.map((link) => (
                link.href === "/logout" ? (
                  <button
                    key={link.label}
                    onClick={() => {
                      // TODO: Implement logout API call
                      // For now, we'll just clear auth state via context
                      const { logout } = useAuth();
                      logout();
                      // Redirect to login
                      window.location.href = "/login";
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-flex flex flex-col">
        <AuthProvider>
          <NavBar />
          <div className="flex-1">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}