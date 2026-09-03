import { AuditLogEntry } from '../types';
import {
  getAuditLogs as getLocalLogs,
  logFieldTransition as logLocalTransition,
  clearAuditLogs as clearLocalLogs,
  exportAuditLogsCsv,
} from '../utils/auditLogger';

// NOTE: The Pamir AI FastAPI backend does not have an audit-log persistence
// endpoint (there is no /api/audit-logs route in main.py) - the previous
// version of this service called that path against this app's own mock
// Express server, which just kept an in-memory array that reset on every
// restart. That's not real backend persistence, so rather than pretend it
// is, this audit trail is honestly local-only: it lives in the browser via
// localStorage (see utils/auditLogger.ts) and survives reloads on this
// device, but is not synced across devices or persisted server-side.
// If real cross-device persistence is needed later, add a genuine
// /api/audit-logs route (with a DB table, same as the users table) to
// Pamir_AI_Backend/main.py and swap the calls back in here.
export const auditService = {
  /** Fetches the local audit trail for this browser/device. */
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    return getLocalLogs();
  },

  /** Records a parameter mutation / field transition in the local audit trail. */
  async recordTransition(
    recordId: string,
    fieldName: string,
    previousValue: string | number,
    newValue: string | number,
    actionType: AuditLogEntry['action_type'] = 'MANUAL_OVERRIDE',
    metadata?: Record<string, unknown>
  ): Promise<AuditLogEntry> {
    return logLocalTransition(recordId, fieldName, previousValue, newValue, actionType, metadata);
  },

  /** Reset / clear local audit log history. */
  async clearLogs(): Promise<void> {
    clearLocalLogs();
  },

  /** Export audit trail as CSV. */
  exportCsv(): void {
    exportAuditLogsCsv();
  }
};
