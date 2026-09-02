export interface ColumnsMetric {
  key: string;
  title: string;
  body: string;
  chart: 'columns';
  unit: string;
  xLabels: string[];
  xAxisLabel: string;
  series: { label: string; color: string; values: (number | null)[] }[];
  yMax: number;
  breakOverflow?: boolean;
  kpis: { value: string }[];
}

export interface LineMetric extends Omit<ColumnsMetric, 'chart' | 'series'> {
  chart: 'line';
  series: { label: string; color: string; values: number[] }[];
}

export interface BarsMetric {
  key: string;
  title: string;
  body: string;
  chart: 'bars';
  unit: string;
  series: { label: string; color: string; value: number }[];
  max: number;
  kpis: { value: string }[];
}

export type Metric = ColumnsMetric;

const CIRCOM = '#DE00FF';
const BARRETENBERG = '#E91900';
const PROVEKIT = '#0D74FF';

export const METRICS: ColumnsMetric[] = [
  {
    key: 'iphone-time',
    title: 'iPhone SE 3 proving time',
    body: 'On a mid-tier 2022 phone, ProveKit finishes the demanding Passport and WebAuthn claims in about three seconds from structured input to serialized proof.',
    chart: 'columns',
    unit: 's',
    xLabels: ['Passport P1', 'WebAuthn', 'OPRF'],
    xAxisLabel: 'PROVABLE CLAIM · COLD MEDIAN',
    series: [
      { label: 'CIRCOM + GROTH16', color: CIRCOM, values: [14.34, 151.42, 1.19] },
      { label: 'NOIR + BARRETENBERG', color: BARRETENBERG, values: [4.9, 5.12, 2.92] },
      { label: 'PROVEKIT V1', color: PROVEKIT, values: [2.43, 3.03, 1.2] },
    ],
    // Keep the meaningful comparison range legible; the 151.42 s Circom
    // WebAuthn outlier is rendered as a broken, clipped column.
    yMax: 16,
    breakOverflow: true,
    kpis: [{ value: '2–3s' }],
  },
  {
    key: 'e15-time',
    title: 'Moto E15 proving time',
    body: 'On a 2 GB, 32-bit Android phone, ProveKit keeps Passport P1 and WebAuthn below 30 seconds. Circom WebAuthn cannot complete its cold run because the proving key exhausts memory.',
    chart: 'columns',
    unit: 's',
    xLabels: ['Passport P1', 'WebAuthn', 'OPRF'],
    xAxisLabel: 'PROVABLE CLAIM · COLD MEDIAN',
    series: [
      { label: 'CIRCOM + GROTH16', color: CIRCOM, values: [241.61, null, 11.5] },
      { label: 'NOIR + BARRETENBERG', color: BARRETENBERG, values: [117.15, 114.65, 70.15] },
      { label: 'PROVEKIT V1', color: PROVEKIT, values: [22, 27.9, 12.68] },
    ],
    yMax: 250,
    kpis: [{ value: '<30s' }],
  },
  {
    key: 'browser-time',
    title: 'Browser proving time',
    body: 'Chrome on an M4 Max used fixed 16-worker policies. ProveKit stays in the same interactive range across all claims; SnarkJS WebAuthn reached extreme memory pressure and produced no proof.',
    chart: 'columns',
    unit: 's',
    xLabels: ['Passport P1', 'WebAuthn', 'OPRF'],
    xAxisLabel: 'PROVABLE CLAIM · COLD MEDIAN',
    series: [
      { label: 'CIRCOM + GROTH16', color: CIRCOM, values: [12.56, null, 0.34] },
      { label: 'NOIR + BARRETENBERG', color: BARRETENBERG, values: [4.95, 5.5, 4.13] },
      { label: 'PROVEKIT V1', color: PROVEKIT, values: [5.48, 5.08, 3.02] },
    ],
    yMax: 14,
    kpis: [{ value: '3–6s' }],
  },
  {
    key: 'payload',
    title: 'Download required to prove',
    body: 'ProveKit needs no trusted setup and ships only a small circuit-specific proving payload. The alternatives require tens of megabytes to more than a gigabyte.',
    chart: 'columns',
    unit: 'MB',
    xLabels: ['Passport P1', 'WebAuthn', 'OPRF'],
    xAxisLabel: 'DEDUPLICATED PROVING PAYLOAD',
    series: [
      { label: 'CIRCOM + GROTH16', color: CIRCOM, values: [508.33, 1753.62, 26.81] },
      { label: 'NOIR + BARRETENBERG', color: BARRETENBERG, values: [271.71, 271.13, 271.06] },
      { label: 'PROVEKIT V1', color: PROVEKIT, values: [2.55, 2.39, 1.65] },
    ],
    yMax: 1800,
    kpis: [{ value: '<3 MB' }],
  },
  {
    key: 'proof-size',
    title: 'Serialized proof size',
    body: 'Transparent, post-quantum proofs are larger than pairing-based proofs, but every measured ProveKit proof remains below the product target of one megabyte.',
    chart: 'columns',
    unit: 'KB',
    xLabels: ['Passport P1', 'WebAuthn', 'OPRF'],
    xAxisLabel: 'SERIALIZED PROOF',
    series: [
      { label: 'CIRCOM + GROTH16', color: CIRCOM, values: [0.93, 1, 0.13] },
      { label: 'NOIR + BARRETENBERG', color: BARRETENBERG, values: [16.32, 21.09, 16.55] },
      { label: 'PROVEKIT V1', color: PROVEKIT, values: [715.89, 716.22, 634.96] },
    ],
    yMax: 750,
    kpis: [{ value: '<1 MB' }],
  },
  {
    key: 'e15-memory',
    title: 'Memory on the low-end phone',
    body: 'Peak process RSS stays below the one-gigabyte design goal for every successful Moto E15 run. The missing Circom WebAuthn result is an out-of-memory gap, not a zero.',
    chart: 'columns',
    unit: 'MB',
    xLabels: ['Passport P1', 'WebAuthn', 'OPRF'],
    xAxisLabel: 'PEAK PROCESS RSS · COLD MEDIAN',
    series: [
      { label: 'CIRCOM + GROTH16', color: CIRCOM, values: [293.37, null, 81.85] },
      { label: 'NOIR + BARRETENBERG', color: BARRETENBERG, values: [465.15, 493.38, 306.09] },
      { label: 'PROVEKIT V1', color: PROVEKIT, values: [474.07, 494.33, 145.08] },
    ],
    yMax: 550,
    kpis: [{ value: '<500 MB' }],
  },
];

export const DETAIL_EXTRAS: Record<
  string,
  { extraKpis: { label: string; value: string }[]; notes: string[] }
> = {
  'iphone-time': {
    extraKpis: [
      { label: 'Passport P1', value: '2.43s' },
      { label: 'WebAuthn', value: '3.03s' },
      { label: 'OPRF', value: '1.20s' },
      { label: 'Device', value: 'A15 / 4 GB' },
    ],
    notes: [
      'iPhone SE 2022, iOS 15.4, native execution',
      'Raw input → witness → serialized proof',
      'Median of five measured samples after one warmup',
    ],
  },
  'e15-time': {
    extraKpis: [
      { label: 'Passport P1', value: '22.00s' },
      { label: 'WebAuthn', value: '27.90s' },
      { label: 'OPRF', value: '12.68s' },
      { label: 'Circom WebAuthn', value: 'OOM' },
    ],
    notes: [
      'Moto E15, Android 14 Go, 2 GB, 32-bit userspace',
      'Circom WebAuthn cold run failed allocating its 1.73 GB zkey',
      'Failed attempts are explicit gaps, never plotted as zero',
    ],
  },
  'browser-time': {
    extraKpis: [
      { label: 'Passport P1', value: '5.48s' },
      { label: 'WebAuthn', value: '5.08s' },
      { label: 'OPRF', value: '3.02s' },
      { label: 'Workers', value: '16' },
    ],
    notes: [
      'Chrome 151 on an Apple M4 Max MacBook Pro',
      'Fixed 16-worker publication policy',
      'SnarkJS WebAuthn stalled after extreme renderer memory pressure',
    ],
  },
  payload: {
    extraKpis: [
      { label: 'Passport P1', value: '2.55 MB' },
      { label: 'WebAuthn', value: '2.39 MB' },
      { label: 'OPRF', value: '1.65 MB' },
      { label: 'Trusted setup', value: 'None' },
    ],
    notes: [
      'Deduplicated circuit-specific proving payload',
      'Excludes app bundles, test harnesses, and device uploads',
      'Barretenberg includes reusable universal setup material',
    ],
  },
  'proof-size': {
    extraKpis: [
      { label: 'Passport P1', value: '716 KB' },
      { label: 'WebAuthn', value: '716 KB' },
      { label: 'OPRF', value: '635 KB' },
      { label: 'Product target', value: '<1 MB' },
    ],
    notes: [
      'Exact serialized proof bytes',
      'Larger proofs are the transparent, post-quantum trade-off',
      'All ProveKit results remain below one megabyte',
    ],
  },
  'e15-memory': {
    extraKpis: [
      { label: 'Passport P1', value: '474 MB' },
      { label: 'WebAuthn', value: '494 MB' },
      { label: 'OPRF', value: '145 MB' },
      { label: 'Design goal', value: '<1 GB' },
    ],
    notes: [
      'Peak process RSS for successful cold samples',
      'Median of five measured samples',
      'Circom WebAuthn is unavailable because the 32-bit process ran out of memory',
    ],
  },
};

export interface SummaryRow {
  label: string;
  unit: string;
  values: [number, number, number];
  better: 'low' | 'high';
}
export const SUMMARY_ROWS: SummaryRow[] = [
  { label: 'iPhone input-to-proof', unit: ' s', values: [14.34, 4.9, 2.43], better: 'low' },
  { label: 'Moto E15 input-to-proof', unit: ' s', values: [241.61, 117.15, 22], better: 'low' },
  { label: 'Browser input-to-proof', unit: ' s', values: [12.56, 4.95, 5.48], better: 'low' },
  { label: 'Proving payload', unit: ' MB', values: [508.33, 271.71, 2.55], better: 'low' },
  { label: 'Serialized proof', unit: ' KB', values: [0.93, 16.32, 715.89], better: 'low' },
  { label: 'Moto E15 peak RSS', unit: ' MB', values: [293.37, 465.15, 474.07], better: 'low' },
];
export const SUMMARY_TOOLKITS = [
  { label: 'CIRCOM + GROTH16', color: CIRCOM },
  { label: 'NOIR + BARRETENBERG', color: BARRETENBERG },
  { label: 'PROVEKIT V1', color: PROVEKIT },
] as const;
