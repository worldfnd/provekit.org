/*
 * LiveDemo — interactive zero-knowledge proof generation widget.
 *
 * Ported from the design system reference at
 *   project/mobile/MobileDemo.jsx
 * with the desktop two-column layout described in chats/chat7.md
 * (left: inputs + CTA, right: live execution trace + KPI strip).
 *
 * Scenario is locked to "Age verification" per the final iteration in chat7.
 * Hash function toggle (Poseidon ↔ SHA-256) controls effective constraint
 * count and timing. The proof bytes are simulated — this is a visual
 * demonstration, not a real prover.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type Scenario = {
  key: string;
  badge: string;
  label: string;
  blurb: string;
  statement: string;
  privates: { label: string; value: string }[];
  publics: { label: string; value: string }[];
  constraints: number;
  estMs: number;
};

const SCENARIO: Scenario = {
  key: 'age',
  badge: '01',
  label: 'Age verification',
  blurb: 'Prove an attribute about yourself without revealing the data behind it.',
  statement: 'I am at least 18 years old.',
  privates: [{ label: 'Date of birth', value: '1995-08-14' }],
  publics: [
    { label: 'Min age', value: '18' },
    { label: 'Today', value: '2026-05-13' },
  ],
  constraints: 8192,
  estMs: 1240,
};

const STEPS = [
  { key: 'compile', label: 'Compile circuit', weight: 0.1 },
  { key: 'witness', label: 'Build witness', weight: 0.18 },
  { key: 'prove', label: 'Generate proof', weight: 0.6 },
  { key: 'verify', label: 'Verify locally', weight: 0.12 },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

const HASHES = [
  { key: 'poseidon', label: 'Poseidon', sub: 'ZK-friendly', cMul: 1.0, tMul: 1.0 },
  { key: 'sha256', label: 'SHA-256', sub: 'Universal', cMul: 3.4, tMul: 3.0 },
] as const;

type Phase = 'idle' | 'running' | 'done';

function hex2(): string {
  return Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, '0');
}
function makeProof(n: number): string[] {
  return Array.from({ length: n }, hex2);
}

type DotState = 'idle' | 'active' | 'done';

function StepDot({ state }: { state: DotState }) {
  const reduce = useReducedMotion();
  const borderColor = state === 'idle' ? 'var(--pk-mute-3, #B7B7B7)' : 'var(--pk-brand)';
  return (
    <span
      style={{
        width: 14,
        height: 14,
        flexShrink: 0,
        position: 'relative',
        border: `1px solid ${borderColor}`,
        background: state === 'done' ? 'var(--pk-brand)' : 'transparent',
      }}
    >
      {state === 'active' && (
        <motion.span
          aria-hidden="true"
          style={{ position: 'absolute', inset: 2, background: 'var(--pk-brand)' }}
          animate={reduce ? { opacity: 1 } : { opacity: [1, 0.35, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {state === 'done' && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 18 18"
          style={{ position: 'absolute', inset: 0 }}
          aria-hidden="true"
        >
          <path
            d="M4 9.5l3 3 7-7"
            fill="none"
            stroke="#fff"
            strokeWidth={2.4}
            strokeLinecap="square"
          />
        </svg>
      )}
    </span>
  );
}

type StepRowProps = {
  step: (typeof STEPS)[number];
  idx: number;
  currentStep: number;
  timing: number | undefined;
  livePhaseMs: number;
  effEstMs: number;
  last: boolean;
};

function StepRow({ step, idx, currentStep, timing, livePhaseMs, effEstMs, last }: StepRowProps) {
  const isCurrent = idx === currentStep;
  const isDone = timing != null;
  const target = effEstMs * step.weight;
  const liveMs = isCurrent ? livePhaseMs : isDone ? (timing as number) : 0;
  const pct = isDone ? 100 : isCurrent ? Math.min(100, (livePhaseMs / target) * 100) : 0;
  const labelColor = isCurrent || isDone ? 'var(--pk-ink)' : 'var(--pk-mute-2)';
  const dotState: DotState = isDone ? 'done' : isCurrent ? 'active' : 'idle';

  return (
    <div
      style={{
        padding: '14px 0',
        borderBottom: last ? 0 : '1px dashed var(--pk-line)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            gap: 12,
            alignItems: 'center',
            minWidth: 0,
          }}
        >
          <StepDot state={dotState} />
          <span
            style={{
              font: '400 11px/1 var(--pk-font-mono)',
              letterSpacing: '0.06em',
              color: 'var(--pk-mute-3, #B7B7B7)',
            }}
          >
            {String(idx + 1).padStart(2, '0')}
          </span>
          <span
            style={{
              font: '500 16px/1 var(--pk-font-sans)',
              letterSpacing: '-0.01em',
              color: labelColor,
            }}
          >
            {step.label}
          </span>
        </span>
        <span
          style={{
            font: '400 12px/1 var(--pk-font-mono)',
            letterSpacing: '0.04em',
            color: isCurrent
              ? 'var(--pk-brand)'
              : isDone
                ? 'var(--pk-ink)'
                : 'var(--pk-mute-3, #B7B7B7)',
          }}
        >
          {isCurrent ? `${Math.round(liveMs)} ms` : isDone ? `${timing} ms` : '—'}
        </span>
      </div>
      <div
        style={{
          marginTop: 10,
          height: 2,
          background: 'var(--pk-line-soft)',
        }}
      >
        <motion.div
          style={{ height: '100%', background: 'var(--pk-brand)' }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: isDone ? 0.25 : 0.1,
            ease: isDone ? [0.2, 0.8, 0.2, 1] : 'linear',
          }}
        />
      </div>
    </div>
  );
}

function KpiCell({
  label,
  value,
  accent,
  br,
  bb,
}: {
  label: string;
  value: string;
  accent?: boolean;
  br?: boolean;
  bb?: boolean;
}) {
  return (
    <div
      style={{
        padding: '20px 24px',
        borderRight: br ? '1px solid var(--pk-line)' : 0,
        borderBottom: bb ? '1px solid var(--pk-line)' : 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          font: '400 11px/1 var(--pk-font-mono)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--pk-mute-2)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          font: '300 28px/1 var(--pk-font-sans)',
          letterSpacing: '-0.02em',
          color: accent ? 'var(--pk-brand)' : 'var(--pk-ink)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

const ARROW = 'M5 12h14M13 6l6 6-6 6';
function ArrowRight() {
  return (
    <span className="pk-arrow" aria-hidden="true">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="square"
      >
        <path d={ARROW} />
      </svg>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="square"
      >
        <path d={ARROW} />
      </svg>
    </span>
  );
}

const SWAP_EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

export default function LiveDemo() {
  const reduce = useReducedMotion();
  const scenario = SCENARIO;

  const [hashIdx, setHashIdx] = useState(0);
  const hash = HASHES[hashIdx]!;
  const effConstraints = Math.round(scenario.constraints * hash.cMul);
  const effEstMs = scenario.estMs * hash.tMul;

  const [phase, setPhase] = useState<Phase>('idle');
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepTimings, setStepTimings] = useState<Partial<Record<StepKey, number>>>({});
  const [livePhaseMs, setLivePhaseMs] = useState(0);
  const [proof, setProof] = useState<string[]>([]);
  const [revealedBytes, setRevealedBytes] = useState(0);
  const runIdRef = useRef(0);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    setPhase('idle');
    setCurrentStep(-1);
    setStepTimings({});
    setLivePhaseMs(0);
    setProof([]);
    setRevealedBytes(0);
  }, []);

  const selectHash = useCallback(
    (i: number) => {
      if (i === hashIdx) return;
      runIdRef.current += 1;
      setHashIdx(i);
      setPhase('idle');
      setCurrentStep(-1);
      setStepTimings({});
      setLivePhaseMs(0);
      setProof([]);
      setRevealedBytes(0);
    },
    [hashIdx],
  );

  const start = useCallback(async () => {
    if (phase === 'running') {
      reset();
      return;
    }
    const myRun = ++runIdRef.current;
    setPhase('running');
    setStepTimings({});
    setProof([]);
    setRevealedBytes(0);

    const finalTimings: Partial<Record<StepKey, number>> = {};
    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i]!;
      const target = effEstMs * step.weight * (0.92 + Math.random() * 0.16);
      setCurrentStep(i);
      const startT = performance.now();
      await new Promise<void>((resolve) => {
        const tick = () => {
          if (runIdRef.current !== myRun) return resolve();
          const elapsed = performance.now() - startT;
          setLivePhaseMs(elapsed);
          if (elapsed >= target) return resolve();
          requestAnimationFrame(tick);
        };
        tick();
      });
      if (runIdRef.current !== myRun) return;
      finalTimings[step.key] = Math.round(target);
      setStepTimings({ ...finalTimings });
      setLivePhaseMs(0);
    }

    setCurrentStep(-1);
    const bytes = makeProof(192);
    setProof(bytes);
    setPhase('done');

    let r = 0;
    const reveal = () => {
      if (runIdRef.current !== myRun) return;
      r = Math.min(bytes.length, r + 6);
      setRevealedBytes(r);
      if (r < bytes.length) setTimeout(reveal, 30);
    };
    reveal();
  }, [phase, effEstMs, reset]);

  // Cancel any in-flight loop on unmount.
  useEffect(() => () => void (runIdRef.current += 1), []);

  const totalMs =
    Object.values(stepTimings).reduce<number>((a, b) => a + (b ?? 0), 0) + livePhaseMs;
  const statusLabel = phase === 'running' ? 'RUNNING' : phase === 'done' ? 'VERIFIED' : 'READY';
  const statusColor =
    phase === 'running'
      ? 'var(--pk-brand)'
      : phase === 'done'
        ? 'var(--pk-brand)'
        : 'var(--pk-mute-3, #B7B7B7)';

  const swapInit = reduce ? { opacity: 0 } : { opacity: 0, y: 8 };
  const swapAnim = reduce ? { opacity: 1 } : { opacity: 1, y: 0 };
  const swapTrans = { duration: 0.36, ease: SWAP_EASE };

  return (
    <div className="pk-live-demo">
      {/* LEFT — inputs + CTA */}
      <div className="pk-live-demo__left">
        <header style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span
            style={{
              font: '400 11px/1 var(--pk-font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--pk-mute-2)',
            }}
          >
            Run on this device · no server
          </span>
          <h3
            style={{
              margin: 0,
              font: '500 48px/1.08 var(--pk-font-sans)',
              letterSpacing: '-0.02em',
              color: 'var(--pk-ink)',
              whiteSpace: 'pre-line',
            }}
          >
            {'Try Provekit right\nin your browser'}
          </h3>
          <p
            style={{
              margin: 0,
              maxWidth: 520,
              font: '300 18px/1.5 var(--pk-font-sans)',
              color: 'var(--pk-mute)',
            }}
          >
            Edit the inputs, then watch a zero-knowledge proof generate live. Nothing leaves this
            page.
          </p>
        </header>

        {/* 01 Private witness */}
        <motion.section
          initial={swapInit}
          animate={swapAnim}
          transition={{ ...swapTrans, delay: reduce ? 0 : 0.04 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 12,
              gap: 8,
            }}
          >
            <span
              style={{
                font: '400 11px/1 var(--pk-font-mono)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--pk-mute-2)',
              }}
            >
              01 · Private witness
            </span>
            <span
              style={{
                font: '400 10px/1 var(--pk-font-mono)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--pk-brand)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{ width: 6, height: 6, background: 'var(--pk-brand)' }}
                aria-hidden="true"
              />
              Local only · never leaves browser
            </span>
          </div>
          <div
            style={{
              border: '1px solid var(--pk-line)',
              background: 'var(--pk-canvas)',
            }}
          >
            {scenario.privates.map((p, i) => (
              <div
                key={p.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: '16px 18px',
                  borderTop: i ? '1px dashed var(--pk-line)' : 0,
                }}
              >
                <span
                  style={{
                    font: '400 10px/1 var(--pk-font-mono)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--pk-mute-2)',
                  }}
                >
                  {p.label}
                </span>
                <span
                  style={{
                    font: '400 16px/1.2 var(--pk-font-mono)',
                    color: 'var(--pk-ink)',
                    wordBreak: 'break-all',
                  }}
                >
                  {p.value}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 02 Public statement */}
        <motion.section
          initial={swapInit}
          animate={swapAnim}
          transition={{ ...swapTrans, delay: reduce ? 0 : 0.08 }}
        >
          <div
            style={{
              font: '400 11px/1 var(--pk-font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--pk-mute-2)',
              marginBottom: 12,
            }}
          >
            02 · Public statement
          </div>
          <div
            style={{
              padding: '18px 20px',
              border: '1px solid var(--pk-ink)',
              background: '#fff',
            }}
          >
            <div
              style={{
                font: '500 20px/1.3 var(--pk-font-sans)',
                letterSpacing: '-0.01em',
                color: 'var(--pk-ink)',
              }}
            >
              {scenario.statement}
            </div>
            <div
              style={{
                marginTop: 12,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 14,
              }}
            >
              {scenario.publics.map((p) => (
                <span
                  key={p.label}
                  style={{
                    font: '400 12px/1 var(--pk-font-mono)',
                    color: 'var(--pk-mute-2)',
                    letterSpacing: '0.04em',
                  }}
                >
                  <span style={{ textTransform: 'uppercase' }}>{p.label}</span>
                  <span style={{ margin: '0 6px', color: 'var(--pk-mute-3, #B7B7B7)' }}>·</span>
                  <span style={{ color: 'var(--pk-ink)' }}>{p.value}</span>
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 03 Hash function */}
        <section>
          <div
            style={{
              font: '400 11px/1 var(--pk-font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--pk-mute-2)',
              marginBottom: 12,
            }}
          >
            03 · Hash function
          </div>
          <div
            role="radiogroup"
            aria-label="Hash function"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              border: '1px solid var(--pk-line)',
            }}
          >
            {HASHES.map((h, i) => {
              const active = i === hashIdx;
              return (
                <button
                  key={h.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => selectHash(i)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 6,
                    padding: '16px 18px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: 0,
                    borderRight: i === 0 ? '1px solid var(--pk-line)' : 0,
                    background: active ? 'var(--pk-brand)' : '#fff',
                    color: active ? '#fff' : 'var(--pk-ink)',
                    font: 'inherit',
                    transition: 'background 0.28s var(--pk-easing), color 0.28s var(--pk-easing)',
                  }}
                >
                  <span
                    style={{
                      font: '500 17px/1 var(--pk-font-sans)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {h.label}
                  </span>
                  <span
                    style={{
                      font: '400 11px/1 var(--pk-font-mono)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      opacity: 0.7,
                    }}
                  >
                    {h.sub}
                  </span>
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`hashsub-${hash.key}`}
              initial={swapInit}
              animate={swapAnim}
              exit={{ opacity: 0 }}
              transition={swapTrans}
              style={{
                marginTop: 12,
                font: '400 12px/1.4 var(--pk-font-mono)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--pk-mute-2)',
              }}
            >
              ≈ {effConstraints.toLocaleString()} constraints · est {Math.round(effEstMs)} ms
            </motion.div>
          </AnimatePresence>
        </section>

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginTop: 4,
          }}
        >
          <button
            type="button"
            onClick={start}
            className="pk-btn pk-btn--primary"
            style={{ height: 52, padding: '0 18px', minWidth: 240 }}
          >
            <span>
              {phase === 'running'
                ? 'ABORT RUN'
                : phase === 'done'
                  ? 'GENERATE AGAIN'
                  : 'GENERATE PROOF'}
            </span>
            <ArrowRight />
          </button>
          {phase !== 'idle' && (
            <button
              type="button"
              onClick={reset}
              className="pk-btn pk-btn--secondary"
              style={{ height: 52, padding: '0 18px' }}
            >
              RESET
            </button>
          )}
        </div>
      </div>

      {/* RIGHT — execution trace + KPI strip */}
      <div className="pk-live-demo__right">
        <div className="pk-live-demo__trace-head">
          <span>
            Trace · {effConstraints.toLocaleString()} constraints · {hash.label}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <motion.span
              aria-hidden="true"
              style={{ width: 7, height: 7, background: statusColor }}
              animate={phase === 'running' && !reduce ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
              transition={
                phase === 'running'
                  ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.2 }
              }
            />
            <span
              style={{
                color: phase === 'idle' ? 'var(--pk-mute-2)' : 'var(--pk-ink)',
              }}
            >
              {statusLabel}
            </span>
          </span>
        </div>

        <div style={{ padding: '8px 24px 16px' }}>
          {STEPS.map((step, i) => (
            <StepRow
              key={step.key}
              step={step}
              idx={i}
              currentStep={currentStep}
              timing={stepTimings[step.key]}
              livePhaseMs={livePhaseMs}
              effEstMs={effEstMs}
              last={i === STEPS.length - 1}
            />
          ))}
        </div>

        {/* Proof artifact preview */}
        <div
          style={{
            borderTop: '1px solid var(--pk-line)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            minHeight: 132,
          }}
          aria-live="polite"
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 8,
            }}
          >
            <span
              style={{
                font: '400 11px/1 var(--pk-font-mono)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--pk-mute-2)',
              }}
            >
              Proof artifact
            </span>
            <span
              style={{
                font: '400 11px/1 var(--pk-font-mono)',
                letterSpacing: '0.04em',
                color: 'var(--pk-mute-3, #B7B7B7)',
              }}
            >
              {revealedBytes}/192 bytes
            </span>
          </div>
          <div
            style={{
              font: '400 11px/1.45 var(--pk-font-mono)',
              letterSpacing: '0.04em',
              color: 'var(--pk-ink)',
              wordBreak: 'break-all',
              minHeight: 64,
            }}
          >
            {proof.slice(0, revealedBytes).map((b, i) => (
              <motion.span
                key={`${i}-${b}`}
                className="pk-demo-byte"
                initial={reduce ? { opacity: 1 } : { opacity: 0, y: -1 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: SWAP_EASE }}
                style={{ display: 'inline-block', marginRight: 4 }}
              >
                {b}
              </motion.span>
            ))}
            {phase === 'running' && (
              <motion.span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: '0.55ch',
                  height: '1em',
                  verticalAlign: '-0.18em',
                  background: 'var(--pk-brand)',
                  marginLeft: 2,
                }}
                animate={reduce ? { opacity: 1 } : { opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </div>
        </div>

        {/* KPI strip — 2x2 grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderTop: '1px solid var(--pk-line)',
          }}
        >
          <KpiCell
            label="Total time"
            value={phase === 'idle' ? '—' : `${Math.round(totalMs)} ms`}
            br
            bb
          />
          <KpiCell
            label="Peak memory"
            value={phase === 'done' ? '38 MB' : phase === 'running' ? 'live…' : '—'}
            bb
          />
          <KpiCell
            label="Verifier gates"
            value={phase === 'done' ? `${Math.round(effConstraints / 1000)}k` : '—'}
            br
          />
          <KpiCell label="Status" value={statusLabel} accent={phase === 'done'} />
        </div>
      </div>
    </div>
  );
}
