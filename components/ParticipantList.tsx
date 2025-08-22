"use client";

import { Dispatch, SetStateAction, useMemo } from "react";
import { useI18n } from "../lib/i18n";

export type MinimalVote = {
  voterName?: string;
  createdAt: string;
};

export default function ParticipantList({
  votes,
  votesLoading,
  highlightName,
  setHighlightName,
  highlightedByCell,
  setHighlightedByCell,
  setSelectedCellKey,
}: {
  votes: MinimalVote[];
  votesLoading: boolean;
  highlightName: string | null;
  setHighlightName: Dispatch<SetStateAction<string | null>>;
  highlightedByCell: Set<string> | null;
  setHighlightedByCell: Dispatch<SetStateAction<Set<string> | null>>;
  setSelectedCellKey: Dispatch<SetStateAction<string | null>>;
}) {
  const { t } = useI18n();

  const orderedNames = useMemo(() => {
    const names: string[] = [];
    const seen = new Set<string>();
    const sortedVotes = votes.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    for (const v of sortedVotes) {
      const name = (v.voterName?.trim() || "Anonymous");
      if (!seen.has(name)) {
        seen.add(name);
        names.push(name);
      }
    }
    return names;
  }, [votes]);

  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>{t("owner.participants")}</h2>
      {votesLoading ? (
        <div className="small" style={{ padding: 12 }}>⏳ {t("public.loading")}</div>
      ) : (orderedNames.length === 0 ? (
        <p className="small">{t("owner.noParticipants")}</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {orderedNames.map((name, idx) => {
            const active = (highlightName === name) || (highlightedByCell?.has(name) ?? false);
            return (
              <button
                key={idx}
                className="btn"
                onClick={() => { setHighlightedByCell(null); setSelectedCellKey(null); setHighlightName(prev => prev === name ? null : name); }}
                style={{
                  background: active ? 'rgb(16,185,129)' : undefined,
                  color: active ? '#fff' : undefined,
                }}
                aria-pressed={active}
              >
                {name}
              </button>
            );
          })}
        </div>
      ))}
    </section>
  );
}
