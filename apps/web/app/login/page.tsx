'use client';

import { useAuth } from "@/auth/provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'enseignant'>('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace this simulated login with actual API call to backend
      // Example:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ role }),
      // });
      // if (!response.ok) throw new Error('Identifiants invalides');
      // const data = await response.json();
      // await login(data.role); // Assuming login now takes the role from response
      // Simulated delay
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          login(role);
          resolve();
        }, 500);
      });
      // Redirect based on role
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/enseignant/dashboard');
      }
    } catch (err) {
      setError('Identifiants invalides');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Connexion - Gestion Scolaire
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Rôle
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'enseignant')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm"
            >
              <option value="admin">Administration</option>
              <option value="enseignant">Enseignant</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus-ring-offset-2 focus-ring-indigo-500"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          Ceci est une simulation d'authentification. Dans la version finale, "
          + "l'authentification se fera auprès du backend NestJS.
        </p>
      </div>
    </div>
  );
}