// Mirror of design-system/ui_kits/landing/BenchmarkSection.jsx METRICS + DETAIL_EXTRAS

export type ChartKind = 'line' | 'bars' | 'columns';

export interface LineMetric {
  key: 'proving';
  title: 'Proving time';
  body: string;
  chart: 'line';
  unit: string;
  xLabels: string[];
  xAxisLabel: string;
  series: { label: string; color: string; values: number[] }[];
  yMax: number;
  kpis: { value: string }[];
}

export interface BarsMetric {
  key: 'memory';
  title: 'Memory footprint';
  body: string;
  chart: 'bars';
  unit: string;
  series: { label: string; color: string; value: number }[];
  max: number;
  kpis: { value: string }[];
}

export interface ColumnsMetric {
  key: 'verify';
  title: 'Verification cost';
  body: string;
  chart: 'columns';
  unit: string;
  xLabels: string[];
  xAxisLabel: string;
  series: { label: string; color: string; values: number[] }[];
  yMax: number;
  kpis: { value: string }[];
}

export type Metric = LineMetric | BarsMetric | ColumnsMetric;

export const METRICS: [LineMetric, BarsMetric, ColumnsMetric] = [
  {
    key: 'proving',
    title: 'Proving time',
    body: 'ProveKit generates proofs ~36% faster than comparable client-side toolkits on commodity hardware.',
    chart: 'line',
    unit: 's',
    xLabels: ['2¹⁰', '2¹⁴', '2¹⁸', '2²²'],
    xAxisLabel: 'CIRCUIT SIZE',
    series: [
      { label: 'TOOLKIT 1', color: '#DE00FF', values: [0.6, 2.4, 9.5, 38.4] },
      { label: 'TOOLKIT 2', color: '#E91900', values: [0.4, 1.5, 6.0, 24.0] },
      { label: 'PROVEKIT', color: '#0D74FF', values: [0.18, 0.7, 2.8, 11.2] },
    ],
    yMax: 40,
    kpis: [{ value: '+36% Faster' }, { value: '11.2s @ 2²²' }],
  },
  {
    key: 'memory',
    title: 'Memory footprint',
    body: 'A streamlined Rust core keeps the resident set ~24% lighter than the next nearest toolkit.',
    chart: 'bars',
    unit: ' MB',
    series: [
      { label: 'TOOLKIT 1', color: '#DE00FF', value: 92 },
      { label: 'TOOLKIT 2', color: '#E91900', value: 64 },
      { label: 'PROVEKIT', color: '#0D74FF', value: 38 },
    ],
    max: 100,
    kpis: [{ value: '+24% Lighter' }, { value: '38 MB peak' }],
  },
  {
    key: 'verify',
    title: 'Verification cost',
    body: 'Verifier circuits compile to a fraction of the gate count, keeping verification cheap on chain and off.',
    chart: 'columns',
    unit: 'k',
    xLabels: ['Setup', 'Compile', 'Verify', 'Settle'],
    xAxisLabel: 'STAGE',
    series: [
      { label: 'TOOLKIT 1', color: '#DE00FF', values: [42, 38, 90, 120] },
      { label: 'TOOLKIT 2', color: '#E91900', values: [28, 24, 64, 80] },
      { label: 'PROVEKIT', color: '#0D74FF', values: [18, 14, 32, 42] },
    ],
    yMax: 120,
    kpis: [{ value: '−68% Gates' }, { value: '32k verify' }],
  },
];

// Detail-page metadata, mirror of BenchmarkDetail.jsx DETAIL_EXTRAS
export const DETAIL_EXTRAS: Record<
  Metric['key'],
  {
    extraKpis: { label: string; value: string }[];
    notes: string[];
  }
> = {
  proving: {
    extraKpis: [
      { label: 'Median', value: '2.8s' },
      { label: 'p95', value: '4.1s' },
      { label: 'p99', value: '6.3s' },
      { label: 'Speedup', value: '+36%' },
    ],
    notes: [
      'Measured on Groth16 reference circuit, 2¹⁸ constraints',
      'All toolkits compiled with Rust 1.79 · release · LTO fat',
      'Single-threaded; multi-thread variants linked in raw results',
    ],
  },
  memory: {
    extraKpis: [
      { label: 'Peak RSS', value: '38 MB' },
      { label: 'Steady', value: '31 MB' },
      { label: 'Page-ins', value: '0' },
      { label: 'vs next', value: '−24%' },
    ],
    notes: [
      'Peak resident set sampled at 50 ms during proving',
      'Heap profile captured with macOS leaks(1) and dtrace',
      'ProveKit reuses witness arenas across batched proofs',
    ],
  },
  verify: {
    extraKpis: [
      { label: 'Verify gates', value: '32k' },
      { label: 'On-chain', value: '210k gas' },
      { label: 'Proof bytes', value: '192 B' },
      { label: 'vs Toolkit 1', value: '−68%' },
    ],
    notes: [
      'Gate counts measured at the verifier circuit only',
      'On-chain costs reflect a Groth16 verifier on EVM Cancun',
      'Proof bytes constant across circuit families',
    ],
  },
};

// Summary table data — mirror of BenchmarksSummary.jsx
export interface SummaryRow {
  label: string;
  unit: string;
  values: [number, number, number];
  better: 'low' | 'high';
}

export const SUMMARY_ROWS: SummaryRow[] = [
  { label: 'Proving time @ 2¹⁸', unit: 's', values: [9.5, 6.0, 2.8], better: 'low' },
  { label: 'Memory peak', unit: ' MB', values: [92, 64, 38], better: 'low' },
  { label: 'Verifier gates', unit: 'k', values: [90, 64, 32], better: 'low' },
  { label: 'Proof bytes', unit: ' B', values: [256, 224, 192], better: 'low' },
  { label: 'Verify (EVM)', unit: 'k gas', values: [620, 420, 210], better: 'low' },
  { label: 'Throughput', unit: ' p/s', values: [0.1, 0.16, 0.36], better: 'high' },
];

export const SUMMARY_TOOLKITS = [
  { label: 'TOOLKIT 1', color: '#DE00FF' },
  { label: 'TOOLKIT 2', color: '#E91900' },
  { label: 'PROVEKIT', color: '#0D74FF' },
] as const;
