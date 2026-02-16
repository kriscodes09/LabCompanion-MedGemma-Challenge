'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import type { WorkflowSafetySummary } from '@/lib/agents/types';

type AgentLogItem = {
  agent: string;
  status: 'ok' | 'warn' | 'error';
  ms?: number;
  message?: string;
};

type ParseQualitySummary = {
  score: number;
  warnings: string[];
};

type Props = {
  agentLog?: AgentLogItem[];
  safetyChecks?: WorkflowSafetySummary;
  processingTime?: number;
  parseQuality?: ParseQualitySummary;
};

function statusStyles(status: AgentLogItem['status']) {
  switch (status) {
    case 'ok':
      return 'bg-green-50 border-green-200 text-green-700';
    case 'warn':
      return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-700';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-700';
  }
}

function statusLabel(status: AgentLogItem['status']) {
  if (status === 'ok') return '✓ OK';
  if (status === 'warn') return '⚠️ WARN';
  return '✕ ERROR';
}

function parseQualityBadge(score: number) {
  if (score >= 85) return { label: 'Parse: Strong', cls: 'text-green-700' };
  if (score >= 70) return { label: 'Parse: OK', cls: 'text-green-700' };
  if (score >= 40) return { label: 'Parse: Risky', cls: 'text-yellow-700' };
  return { label: 'Parse: Low', cls: 'text-red-700' };
}

export default function AgentDashboard({ agentLog, safetyChecks, processingTime, parseQuality }: Props) {
  const [open, setOpen] = useState(false);

  const sorted = useMemo(() => {
    if (!agentLog) return [];
    return agentLog.filter((x) => x?.agent);
  }, [agentLog]);

  const hasLog = sorted.length > 0;

  const pqScore = typeof parseQuality?.score === 'number' ? parseQuality.score : null;
  const showParseBadge = pqScore !== null && pqScore < 70;

  const pq = pqScore !== null ? parseQualityBadge(pqScore) : null;

  return (
    <div className="w-full">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold">🤖 Agent Intelligence</h2>
            <p className="text-sm text-gray-600">
              Transparent multi-agent run log (what ran, how long it took, and what happened).
            </p>

            {/* ✅ Phase C Step 3: subtle parse-quality warning under header */}
            {showParseBadge && pq && (
              <p className="text-sm mt-2">
                <span className={`font-semibold ${pq.cls}`}>{pq.label}</span>{' '}
                <span className="text-gray-600">({pqScore}/100)</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {typeof processingTime === 'number' && (
              <div className="text-sm text-gray-700">
                ⏱️ <span className="font-semibold">{processingTime}ms</span>
              </div>
            )}

            {safetyChecks && (
              <div className="text-sm text-gray-700">
                🛡️{' '}
                <span className={`font-semibold ${safetyChecks.allSafe ? 'text-green-700' : 'text-yellow-700'}`}>
                  {safetyChecks.allSafe ? 'Passed' : 'Warnings'}
                </span>{' '}
                <span className="text-gray-500">
                  ({safetyChecks.checkedItems} checks • {safetyChecks.violations} issues)
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="text-sm font-semibold underline underline-offset-4"
            >
              {open ? 'Hide' : 'Show'} details
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-5">
            {/* ✅ Parse quality details (only if badge is showing) */}
            {showParseBadge && pqScore !== null && (
              <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
                <div className="text-sm font-semibold mb-1">Parse Quality</div>
                <div className="text-sm text-gray-700">
                  Score: <span className="font-semibold">{pqScore}/100</span>
                </div>

                {Array.isArray(parseQuality?.warnings) && parseQuality.warnings.length > 0 && (
                  <ul className="mt-2 text-sm text-gray-700 list-disc pl-5 space-y-1">
                    {parseQuality.warnings.slice(0, 3).map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                )}

                <div className="text-sm text-gray-600 mt-3">
                  Tip: try a clearer photo, crop to the results table, or upload a different page.
                </div>
              </Card>
            )}

            {!hasLog ? (
              <div className="text-sm text-gray-600">
                No agent log found. This usually means the orchestrator isn’t returning <code>agentLog</code> yet.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {sorted.map((item, idx) => (
                  <Card key={`${item.agent}-${idx}`} className={`p-4 border ${statusStyles(item.status)}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-sm">{item.agent}</div>
                        {item.message && <div className="text-xs opacity-90 mt-1">{item.message}</div>}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold">{statusLabel(item.status)}</div>
                        {typeof item.ms === 'number' && <div className="text-xs opacity-90 mt-1">{item.ms}ms</div>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Optional: show raw safety summary */}
            {safetyChecks && (
              <Card className="p-4 mt-4 bg-blue-50 border-blue-200">
                <div className="text-sm font-semibold mb-1">Safety Summary</div>
                <div className="text-sm text-gray-700">
                  • All safe: <span className="font-semibold">{String(safetyChecks.allSafe)}</span>
                  <br />
                  • Checked items: <span className="font-semibold">{safetyChecks.checkedItems}</span>
                  <br />
                  • Violations: <span className="font-semibold">{safetyChecks.violations}</span>
                </div>
              </Card>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}