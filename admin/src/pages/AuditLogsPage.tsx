import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { AuditLogItem } from '../types/admin';
import { ShieldCheck, User } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.getAuditLogs();
        if (res && res.success && res.data) {
          setLogs(res.data);
        }
      } catch (err) {
        console.warn('Audit logs error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Administrative Audit Trail</h2>
          <p className="text-sm text-gray-500 mt-1">
            Immutable security records of moderation interventions, account restrictions, and privileged actions.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 self-start sm:self-auto">
          {logs.length} Recorded Interventions
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3.5">Action Executed</th>
                <th className="px-6 py-3.5">Administrator</th>
                <th className="px-6 py-3.5">Target Entity</th>
                <th className="px-6 py-3.5">Details</th>
                <th className="px-6 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Loading security audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No administrative actions recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-gray-100 text-gray-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-agri-600" />
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-agri-100 text-agri-700 flex items-center justify-center font-bold text-[10px]">
                          <User className="w-3 h-3" />
                        </div>
                        <span className="font-medium text-xs text-gray-900">{log.performedBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-xs text-gray-900 uppercase tracking-wide">{log.targetType}</p>
                      <p className="text-xs font-mono text-gray-400">{log.targetId ? `${log.targetId.slice(0, 10)}...` : 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : 'None'}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
