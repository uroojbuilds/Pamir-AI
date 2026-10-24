import { auditService } from '../services';
import { fmtDate } from '../lib/format';
import { useApp } from '../state/AppContext';
import { AppShell } from '../components/Shell';
import { Tag } from '../components/ui';

export function Audit() {
  const { auditLogs, refreshAudit, toast } = useApp();
  return (
    <AppShell on="audit">
      <h1>Audit Trail</h1>
      <p className="sub">Every change to capital, quantity, category, product and every export. Stored on this device only.</p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button className="btn o sm" type="button" onClick={() => auditService.exportCsv()}>Export CSV</button>
        <button className="btn o sm" type="button" onClick={async () => { await auditService.clearLogs(); refreshAudit(); toast('Audit trail reset'); }}>Reset</button>
        <span className="mut small" style={{ alignSelf: 'center' }}>{auditLogs.length} entries</span>
      </div>
      <div className="card scroll">
        <table className="wide">
          <thead><tr><th>Time</th><th>Record</th><th>Field</th><th>Change</th><th>Action</th><th>User</th></tr></thead>
          <tbody>
            {auditLogs.map((l) => (
              <tr key={l.id}>
                <td>{fmtDate(l.timestamp)}</td><td>{l.record_id}</td><td>{l.field_name}</td>
                <td>{String(l.previous_value)} → {String(l.new_value)}</td>
                <td><Tag kind="n">{l.action_type}</Tag></td><td>{l.user_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {auditLogs.length === 0 && <p className="mut" style={{ padding: 12 }}>Nothing recorded yet.</p>}
      </div>
    </AppShell>
  );
}
