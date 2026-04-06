export interface AuditLogEntry {
  id: string;
  action: string;
  target: string;
  performedBy: string;
  timestamp: number;
  details?: string;
}

const AUDIT_LOG_KEY = "doitepic_audit_log";

export function logAuditAction(
  action: string,
  target: string,
  performedBy: string,
  details?: string,
) {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    const logs: AuditLogEntry[] = raw ? JSON.parse(raw) : [];
    logs.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      action,
      target,
      performedBy,
      timestamp: Date.now(),
      details,
    });
    if (logs.length > 500) logs.splice(500);
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
  } catch {
    // ignore
  }
}

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearAuditLogs(): void {
  try {
    localStorage.removeItem(AUDIT_LOG_KEY);
  } catch {
    // ignore
  }
}
