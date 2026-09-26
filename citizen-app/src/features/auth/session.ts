export type CitizenSession = {
  name: string;
  phone: string;
  role?: 'citizen' | 'admin';
  authenticatedAt: number;
};

const STORAGE_KEY = "infrapulse.session.v1";
const LEGACY_AUTH = "citizen_authenticated";

export function readSession(): CitizenSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as CitizenSession;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  if (window.localStorage.getItem(LEGACY_AUTH) === "true") {
    const migrated: CitizenSession = {
      name: window.localStorage.getItem("citizen_name") || "Citizen",
      phone: window.localStorage.getItem("citizen_phone") || "",
      authenticatedAt: Date.now(),
    };
    writeSession(migrated);
    return migrated;
  }

  return null;
}

export function writeSession(session: CitizenSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.localStorage.setItem(LEGACY_AUTH, "true");
  window.localStorage.setItem("citizen_name", session.name);
  window.localStorage.setItem("citizen_phone", session.phone);
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_AUTH);
  window.localStorage.removeItem("citizen_name");
  window.localStorage.removeItem("citizen_phone");
}
