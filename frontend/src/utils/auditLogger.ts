import { AuditLogEntry } from '../types';

const AUDIT_STORAGE_KEY = 'pamirai_audit_trail_v1';
const CURRENT_USER_EMAIL = 'kafa.rwp@gmail.com';

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) {
      const initialLogs = generateInitialAuditSeed();
      saveAuditLogs(initialLogs);
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch {
    return generateInitialAuditSeed();
  }
}

export function saveAuditLogs(logs: AuditLogEntry[]): void {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save audit logs to localStorage:', e);
  }
}

export function logFieldTransition(
  recordId: string,
  fieldName: string,
  previousValue: string | number,
  newValue: string | number,
  actionType: AuditLogEntry['action_type'] = 'MANUAL_OVERRIDE',
  metadata?: Record<string, unknown>
): AuditLogEntry {
  const currentLogs = getAuditLogs();
  const timestamp = new Date().toISOString();
  const logId = `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  const newEntry: AuditLogEntry = {
    id: logId,
    record_id: recordId,
    timestamp,
    user_id: CURRENT_USER_EMAIL,
    field_name: fieldName,
    previous_value: previousValue,
    new_value: newValue,
    action_type: actionType,
    metadata
  };

  const updated = [newEntry, ...currentLogs].slice(0, 100); // keep last 100 transitions
  saveAuditLogs(updated);
  return newEntry;
}

export function clearAuditLogs(): void {
  const fresh = generateInitialAuditSeed();
  saveAuditLogs(fresh);
}

export function exportAuditLogsCsv(): void {
  const logs = getAuditLogs();
  const headers = ['ID', 'Timestamp', 'Record ID', 'User Email', 'Field Name', 'Previous Value', 'New Value', 'Action Type'];
  const rows = logs.map(log => [
    log.id,
    log.timestamp,
    log.record_id,
    log.user_id,
    log.field_name,
    `"${String(log.previous_value).replace(/"/g, '""')}"`,
    `"${String(log.new_value).replace(/"/g, '""')}"`,
    log.action_type
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `pamirai_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function generateInitialAuditSeed(): AuditLogEntry[] {
  const baseTime = new Date('2026-08-31T13:45:00.000Z').getTime();
  return [
    {
      id: 'LOG-SYS-001',
      record_id: 'REC-P001',
      timestamp: new Date(baseTime).toISOString(),
      user_id: CURRENT_USER_EMAIL,
      field_name: 'capital',
      previous_value: '0',
      new_value: '25000',
      action_type: 'INITIAL_LOAD',
      metadata: { source: 'Preset Lot P001 macro' }
    },
    {
      id: 'LOG-SYS-002',
      record_id: 'REC-P001',
      timestamp: new Date(baseTime + 120000).toISOString(),
      user_id: CURRENT_USER_EMAIL,
      field_name: 'total_landed_cost_pkr',
      previous_value: '0',
      new_value: '25954.90',
      action_type: 'RECALCULATION',
      metadata: { duty_rate_percent: 20, air_freight_usd_kg: 5.0 }
    },
    {
      id: 'LOG-SYS-003',
      record_id: 'REC-P001',
      timestamp: new Date(baseTime + 180000).toISOString(),
      user_id: CURRENT_USER_EMAIL,
      field_name: 'viability_score',
      previous_value: '50',
      new_value: '80',
      action_type: 'RECALCULATION',
      metadata: { status: 'curated (+15)', trade_assurance: 'true (+15)' }
    }
  ];
}
