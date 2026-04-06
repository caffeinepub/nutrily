import { useCallback, useEffect, useState } from "react";
import type { ProfileGoal } from "../backend";

export interface LocalUser {
  name: string;
  username: string; // user code e.g. EPIC-A3X9KZ
  phone?: string; // optional phone number for persistent login
  age: number;
  weightKg: number;
  heightCm: number;
  gender: string;
  goal: ProfileGoal;
  joinedAt: string;
}

const SESSION_KEY = "doitepic_user";
// Persistent registry of ALL registered profiles, keyed by user code.
// Logout clears the session but NOT the registry.
const REGISTRY_KEY = "doitepic_user_registry";

// ---- Registry helpers ----
export function saveToRegistry(profile: LocalUser) {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    const registry: Record<string, LocalUser> = raw ? JSON.parse(raw) : {};
    registry[profile.username.toUpperCase()] = profile;
    // Also index by phone for phone-based login
    if (profile.phone) {
      registry[`phone:${profile.phone}`] = profile;
    }
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  } catch {
    // ignore
  }
}

export function lookupByCode(code: string): LocalUser | null {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return null;
    const registry: Record<string, LocalUser> = JSON.parse(raw);
    return registry[code.trim().toUpperCase()] ?? null;
  } catch {
    return null;
  }
}

export function lookupByPhone(phone: string): LocalUser | null {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return null;
    const registry: Record<string, LocalUser> = JSON.parse(raw);
    return registry[`phone:${phone}`] ?? null;
  } catch {
    return null;
  }
}
// --------------------------

function readSession(): LocalUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
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
let _user: LocalUser | null = readSession();
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
      const u = readSession();
      _setUser(u);
    };
    window.addEventListener("storage", handler);
    return () => {
      _listeners.delete(setUser);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const login = useCallback((profile: LocalUser) => {
    // Always persist to registry so the user can log back in after logout
    saveToRegistry(profile);
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    _setUser(profile);
  }, []);

  const logout = useCallback(() => {
    // Only clear the session — registry stays so login with code still works
    localStorage.removeItem(SESSION_KEY);
    _setUser(null);
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    login,
    logout,
  };
}
