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

// ---- Shared module-level state so all hook instances stay in sync ----
type Listener = (user: LocalUser | null) => void;
let _user: LocalUser | null = readUser();
const _listeners = new Set<Listener>();

function _setUser(next: LocalUser | null) {
  _user = next;
  for (const fn of _listeners) fn(next);
}
// ----------------------------------------------------------------------

export function useLocalAuth() {
  const [user, setUser] = useState<LocalUser | null>(() => _user);

  useEffect(() => {
    // Subscribe to module-level changes (same tab)
    _listeners.add(setUser);
    // Also listen for cross-tab storage events
    const handler = () => {
      const u = readUser();
      _setUser(u);
    };
    window.addEventListener("storage", handler);
    return () => {
      _listeners.delete(setUser);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const login = useCallback((profile: LocalUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    _setUser(profile);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    _setUser(null);
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    login,
    logout,
  };
}
