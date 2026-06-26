import { useState } from "react";
import type { Skill } from "../types";
import { maxDepth, mostRecentSkill } from "../utils/stats";
import { buildActivityGrid, activityColor } from "../utils/activity";
import { MILESTONES, BADGES } from "../constants";
import { BadgeIcon } from "./BadgeIcon";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
      <div style={{ color: "var(--text-1)", fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function HeatCell({ day }: { day: { date: string; count: number; future: boolean } }) {
  const [hover, setHover] = useState(false);

  const label = day.future ? null
    : day.count === 0 ? "No skills"
    : `${day.count} skill${day.count !== 1 ? "s" : ""}`;

  const fmtDate = day.future ? "" : new Date(day.date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <div style={{ position: "relative", height: 10 }}>
      <div
        onMouseEnter={() => !day.future && setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ height: 10, borderRadius: 2, background: activityColor(day.count, day.future), border: day.future ? "none" : "1px solid rgba(0,0,0,0.08)" }}
      />
      {hover && !day.future && (
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "#fff", fontSize: 10, borderRadius: 5, padding: "5px 8px", whiteSpace: "nowrap", zIndex: 99, pointerEvents: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.25)", lineHeight: 1.5 }}>
          <div style={{ fontWeight: 600 }}>{label}</div>
          <div style={{ color: "#9ca3af", fontSize: 9 }}>{fmtDate}</div>
        </div>
      )}
    </div>
  );
}

const TIER_BADGES = BADGES.filter((b) => ["bronze", "silver", "gold", "platinum", "ruby"].includes(b.tier));
const ACHIEVEMENT_BADGES = BADGES.filter((b) => !["bronze", "silver", "gold", "platinum", "ruby"].includes(b.tier));

export function LeftPanel({ skills }: { skills: Skill[] }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const totalSkills = skills.length;
  const totalTrees = skills.filter((s) => s.parent === null).length;
  const deepest = maxDepth(skills);
  const recent = mostRecentSkill(skills);

  const nextMilestone = MILESTONES.find((m) => m.count > totalSkills);
  const prevMilestone = [...MILESTONES].reverse().find((m) => m.count <= totalSkills);
  const progress = nextMilestone
    ? Math.round((totalSkills / nextMilestone.count) * 100)
    : 100;

  const { weeks, startDate, endDate } = buildActivityGrid(skills, weekOffset);
  const totalInView = weeks.flat().reduce((n, d) => n + (d.future ? 0 : d.count), 0);
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10, padding: "20px 0 20px 20px", overflowY: "auto", borderRight: "1px solid var(--border)" }}>

      {/* Overview */}
      <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", paddingLeft: 2, marginBottom: 2 }}>Overview</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <StatCard label="Total skills" value={totalSkills} />
        <StatCard label="Skill trees" value={totalTrees} />
        <StatCard label="Deepest chain" value={deepest === 0 ? "—" : deepest} />
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
          <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Most recent</div>
          <div style={{ color: "var(--text-1)", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {recent ? recent.title : "—"}
          </div>
          {recent?.createdAt && (
            <div style={{ color: "var(--text-3)", fontSize: 10, marginTop: 4 }}>
              {new Date(recent.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

      {/* Activity heatmap */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ color: "var(--text-1)", fontSize: 13, fontWeight: 600 }}>{totalInView} skill{totalInView !== 1 ? "s" : ""}</div>
            <div style={{ color: "var(--text-3)", fontSize: 10, marginTop: 1 }}>{fmt(startDate)} — {fmt(endDate)}</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setWeekOffset((o) => o + 1)} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-2)", fontSize: 11, width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
            <button onClick={() => setWeekOffset((o) => Math.max(0, o - 1))} disabled={weekOffset === 0} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: weekOffset === 0 ? "var(--text-3)" : "var(--text-2)", fontSize: 11, width: 24, height: 24, cursor: weekOffset === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 2, marginBottom: 4, paddingLeft: 14 }}>
          {dayLabels.map((l, i) => (
            <div key={i} style={{ width: 10, fontSize: 8, color: "var(--text-3)", textAlign: "center" }}>{i % 2 === 0 ? l : ""}</div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 2, position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 1 }}>
            {dayLabels.map((l, i) => (
              <div key={i} style={{ height: 10, fontSize: 8, color: "var(--text-3)", lineHeight: "10px", width: 12, textAlign: "right" }}>{l}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 2, flex: 1 }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                {week.map((day, di) => <HeatCell key={di} day={day} />)}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10, justifyContent: "flex-end" }}>
          {(["var(--border)", "#86efac", "#4ade80", "#00754A"] as const).map((c, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: c, border: "1px solid rgba(0,0,0,0.06)" }} />
              <span style={{ color: "var(--text-3)", fontSize: 8 }}>{i === 3 ? "3+" : i}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

      {/* Milestone Tier Badges */}
      <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", paddingLeft: 2, marginBottom: 2 }}>Milestone Tiers</div>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 14px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
          {TIER_BADGES.map((badge) => {
            const unlocked = badge.unlocked(skills);
            return (
              <div
                key={badge.id}
                title={`${badge.name} — ${badge.desc}`}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1, minWidth: 0 }}
              >
                <BadgeIcon tier={badge.tier} unlocked={unlocked} />
                <div style={{
                  color: unlocked ? "var(--text-2)" : "var(--text-3)",
                  fontSize: 9,
                  fontWeight: unlocked ? 600 : 400,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}>
                  {badge.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

      {/* Achievement Badges */}
      <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", paddingLeft: 2, marginBottom: 2 }}>Achievements</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ACHIEVEMENT_BADGES.map((badge) => {
          const unlocked = badge.unlocked(skills);
          return (
            <div key={badge.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, opacity: unlocked ? 1 : 0.85 }}>
              <BadgeIcon tier={badge.tier} unlocked={unlocked} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: unlocked ? "var(--text-1)" : "var(--text-3)", fontSize: 12, fontWeight: 600 }}>{badge.name}</div>
                <div style={{ color: "var(--text-3)", fontSize: 10, marginTop: 2 }}>{badge.desc}</div>
                {unlocked && <div style={{ color: "var(--green)", fontSize: 9, marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Unlocked</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

      {/* Milestone progress */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
        <div style={{ color: "var(--text-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          {prevMilestone ? `Milestone · ${prevMilestone.label}` : "Milestones"}
        </div>
        {nextMilestone ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "var(--text-2)", fontSize: 11 }}>{totalSkills} / {nextMilestone.count} skills</span>
              <span style={{ color: "var(--green)", fontSize: 11, fontWeight: 600 }}>{progress}%</span>
            </div>
            <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "var(--green)", borderRadius: 2, transition: "width 0.4s" }} />
            </div>
            <div style={{ color: "var(--text-3)", fontSize: 10, marginTop: 7 }}>Next: {nextMilestone.label}</div>
          </>
        ) : (
          <div style={{ color: "var(--green-hi)", fontSize: 12, fontWeight: 600 }}>All milestones reached</div>
        )}
      </div>
    </div>
  );
}
