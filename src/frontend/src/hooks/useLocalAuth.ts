import { useCallback, useEffect, useState } from "react";
import type { ProfileGoal } from "../backend";

export interface LocalUser {
  name: string;
  username: string; // user code e.g. EPIC-A3X9KZ
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
    const parsed = JSON.parse(raw) as any;
    // Migrate old phone-based profiles
    if (parsed.phone && !parsed.username) {
      parsed.username = parsed.phone;
      parsed.phone = undefined;
    }
    return parsed as LocalUser;
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
    _listeners.add(setUser);
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
