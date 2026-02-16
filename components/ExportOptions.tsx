'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { downloadTextFile } from '@/lib/export/simple-export';
import type { LabValue } from '@/lib/types';
import type { WorkflowResult } from '@/lib/agents/types';

interface ExportOptionsProps {
  results: LabValue[];
  onClose: () => void;
}

/** What we expect Questions Agent to output */
type QuestionsByMarker = {
  marker: string;
  questions: string[];
};

function isQuestionsByMarker(x: unknown): x is QuestionsByMarker {
  if (typeof x !== 'object' || x === null) return false;
  const obj = x as Record<string, unknown>;
  if (typeof obj.marker !== 'string') return false;
  if (!Array.isArray(obj.questions)) return false;
  return obj.questions.every((q) => typeof q === 'string');
}

function readQuestionsFromSession(): QuestionsByMarker[] | null {
  const raw = sessionStorage.getItem('analysisSession');
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  // We only need session.questions — don’t force the entire object shape
  const session = parsed as Partial<WorkflowResult>;
  const questionsUnknown = session.questions as unknown;

  if (!Array.isArray(questionsUnknown)) return null;

  const cleaned = questionsUnknown.filter(isQuestionsByMarker);
  return cleaned.length > 0 ? cleaned : null;
}

export function ExportOptions({ results, onClose }: ExportOptionsProps) {
  const [selectedOptions, setSelectedOptions] = useState({
    learningSummary: true,
    questions: true,
    abnormalOnly: true,
  });

  const abnormalValues = useMemo(
    () => results.filter((v) => v.status !== 'normal'),
    [results]
  );

  const valuesToExport = useMemo(
    () => (selectedOptions.abnormalOnly ? abnormalValues : results),
    [selectedOptions.abnormalOnly, abnormalValues, results]
  );

  function handleExport() {
    // Pull Questions Agent output (single source of truth)
    const sessionQuestions = selectedOptions.questions ? readQuestionsFromSession() : null;

    // If the user asked to include questions, but we don’t have them, don’t “fake it”
    if (selectedOptions.questions && !sessionQuestions) {
      alert(
        'Questions are unavailable because no analysis session was found.\n\nPlease re-run Analyze Lab Report, then export again.'
      );
      return;
    }

    // Filter questions to only include markers being exported
    const markerSet = new Set(valuesToExport.map((v) => v.marker));
    const filteredQuestions = (sessionQuestions ?? []).filter((q) => markerSet.has(q.marker));

    let content = '';

    // Header
    content += '═══════════════════════════════════════════════════════\n';
    content += '           LAB RESULTS LITERACY COMPANION\n';
    content += '              Doctor Visit Preparation\n';
    content += '═══════════════════════════════════════════════════════\n\n';
    content += `Generated: ${new Date().toLocaleString()}\n\n`;
    content += '⚠️  IMPORTANT: This is an educational tool only.\n';
    content += '    Not medical advice. Discuss with your healthcare provider.\n\n';

    // Learning Summary
    if (selectedOptions.learningSummary) {
      content += '═══════════════════════════════════════════════════════\n';
      content += 'MY LEARNING SUMMARY\n';
      content += '═══════════════════════════════════════════════════════\n\n';

      content += `I reviewed my lab results and learned about ${valuesToExport.length} markers.\n\n`;

      if (abnormalValues.length > 0) {
        content += `Markers needing discussion:\n`;
        abnormalValues.forEach((v) => {
          const symbol = v.status === 'low' ? '↓' : v.status === 'high' ? '↑' : '•';
          content += `  ${symbol} ${v.marker}: ${v.value} ${v.unit} (${v.status.toUpperCase()})\n`;
        });
        content += '\n';
      }

      content += 'What I learned:\n';
      valuesToExport.forEach((v) => {
        content += `\n${v.marker}:\n`;
        content += `  • Current value: ${v.value} ${v.unit}\n`;
        content += `  • Reference range: ${v.referenceRange}\n`;
        content += `  • Status: ${v.status.toUpperCase()}\n`;
        content += '  • Key points from research:\n';
        content += '    - [Space to write notes from educational content]\n';
        content += '    - \n';
        content += '    - \n';
      });
      content += '\n\n';
    }

    // Questions (from Questions Agent ONLY)
    if (selectedOptions.questions) {
      content += '═══════════════════════════════════════════════════════\n';
      content += 'QUESTIONS FOR MY DOCTOR\n';
      content += '═══════════════════════════════════════════════════════\n\n';

      if (filteredQuestions.length === 0) {
        content += 'No questions were found for the selected markers.\n';
        content += 'Tip: Re-run analysis and try exporting again.\n\n';
      } else {
        filteredQuestions.forEach((q) => {
          content += `${q.marker}:\n`;
          q.questions.forEach((question, idx) => {
            content += `  ${idx + 1}. ${question}\n`;
          });
          content += '\n';
        });

        content += '\n';
        content += 'Additional questions:\n';
        content += '  • \n';
        content += '  • \n';
        content += '  • \n\n';
      }
    }

    // Doctor's notes section
    content += '═══════════════════════════════════════════════════════\n';
    content += 'NOTES FROM DOCTOR VISIT\n';
    content += '═══════════════════════════════════════════════════════\n\n';
    content += 'Date: _______________\n\n';
    content += "Doctor's explanation:\n\n\n\n\n";
    content += 'Next steps:\n';
    content += '  □ \n';
    content += '  □ \n';
    content += '  □ \n\n';
    content += 'Follow-up appointment: _______________\n\n';

    // Footer
    content += '───────────────────────────────────────────────────────\n';
    content += 'Generated by Lab Results Literacy Companion\n';
    content += 'Privacy-first • Educational only • Not medical advice\n';
    content += '───────────────────────────────────────────────────────\n';

    const filename = `doctor-visit-prep-${new Date().toISOString().split('T')[0]}.txt`;
    downloadTextFile(content, filename);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Export Options</h2>
        <p className="text-gray-600 mb-6">
          Choose what to include in your doctor visit preparation sheet:
        </p>

        <div className="space-y-4 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedOptions.learningSummary}
              onChange={(e) =>
                setSelectedOptions({
                  ...selectedOptions,
                  learningSummary: e.target.checked,
                })
              }
              className="mt-1"
            />
            <div>
              <div className="font-medium">My Learning Summary</div>
              <div className="text-sm text-gray-600">
                Include space to write what you learned about each marker
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedOptions.questions}
              onChange={(e) =>
                setSelectedOptions({
                  ...selectedOptions,
                  questions: e.target.checked,
                })
              }
              className="mt-1"
            />
            <div>
              <div className="font-medium">Questions for Doctor</div>
              <div className="text-sm text-gray-600">
                Include prepared questions based on your results (from the Questions Agent)
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedOptions.abnormalOnly}
              onChange={(e) =>
                setSelectedOptions({
                  ...selectedOptions,
                  abnormalOnly: e.target.checked,
                })
              }
              className="mt-1"
            />
            <div>
              <div className="font-medium">Abnormal Values Only</div>
              <div className="text-sm text-gray-600">
                Focus on values outside normal range (recommended)
              </div>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            className="flex-1"
            disabled={!selectedOptions.learningSummary && !selectedOptions.questions}
          >
            📄 Export
          </Button>
        </div>
      </Card>
    </div>
  );
}
