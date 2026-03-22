import { useCallback, useEffect, useState } from "react";
import type { ProfileGoal } from "../backend";

export interface LocalUser {
  name: string;
  phone: string;
  age: number;
  weightKg: number;
  heightCm: number;
  gender: string;
  goal: ProfileGoal;
  joinedAt: string;
}

const STORAGE_KEY = "doitepic_user";

function readUser(): LocalUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalUser;
  } catch {
    return null;
  }
}

export function useLocalAuth() {
  const [user, setUser] = useState<LocalUser | null>(readUser);

  // Keep in sync across tabs
  useEffect(() => {
    const handler = () => setUser(readUser());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const login = useCallback((profile: LocalUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    login,
    logout,
  };
}
