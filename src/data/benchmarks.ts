// Mirror of design-system/ui_kits/landing/BenchmarkSection.jsx METRICS + DETAIL_EXTRAS
//
// Data: ProveKit-team measurements of three toolkits proving the same
// SHA-256 preimage circuit on a MacBook Air (Apple M2 · 16 GB), witness
// generation included, June 2026. Systems: ProveKit v1 (WHIR · 52,029
// R1CS constraints), Barretenberg (UltraHonk · 20,524 gates), Circom
// (Groth16 · native rapidsnark · 90,633 R1CS).

export type ChartKind = 'line' | 'bars' | 'columns';
export type MetricKey = 'proving' | 'memory' | 'artifacts';

export interface LineMetric {
  key: MetricKey;
  title: string;
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
  key: MetricKey;
  title: string;
  body: string;
  chart: 'bars';
  unit: string;
  series: { label: string; color: string; value: number }[];
  max: number;
  kpis: { value: string }[];
}

export interface ColumnsMetric {
  key: MetricKey;
  title: string;
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

export const METRICS: [BarsMetric, ColumnsMetric, ColumnsMetric] = [
  {
    key: 'proving',
    title: 'Proving time',
    body: 'ProveKit proves SHA-256 in 0.37 s on a MacBook Air, ahead of Barretenberg at 0.39 s and Circom at 0.40 s, witness generation included.',
    chart: 'bars',
    unit: 's',
    series: [
      { label: 'BARRETENBERG', color: '#DE00FF', value: 0.39 },
      { label: 'CIRCOM', color: '#E91900', value: 0.4 },
      { label: 'PROVEKIT', color: '#0D74FF', value: 0.37 },
    ],
    max: 0.5,
    kpis: [{ value: '0.37s' }, { value: 'Fastest prover' }],
  },
  {
    key: 'memory',
    title: 'Memory footprint',
    body: 'Proving peaks at 118.9 MiB resident, well within a phone-class memory budget.',
    chart: 'columns',
    unit: ' MiB',
    xLabels: ['While proving'],
    xAxisLabel: 'PEAK RSS',
    series: [
      { label: 'BARRETENBERG', color: '#DE00FF', values: [157.9] },
      { label: 'CIRCOM', color: '#E91900', values: [96.7] },
      { label: 'PROVEKIT', color: '#0D74FF', values: [118.9] },
    ],
    yMax: 160,
    kpis: [{ value: '118.9 MiB' }, { value: 'Peak while proving' }],
  },
  {
    key: 'artifacts',
    title: 'Setup artifacts',
    body: 'A device downloads under 1 MiB of ProveKit keys to start proving, against a 128 MiB CRS for Barretenberg or a 50.9 MiB zkey for Circom.',
    chart: 'columns',
    unit: ' MiB',
    xLabels: ['Per circuit'],
    xAxisLabel: 'SHA-256 CIRCUIT',
    series: [
      { label: 'BARRETENBERG', color: '#DE00FF', values: [128] },
      { label: 'CIRCOM', color: '#E91900', values: [50.9] },
      { label: 'PROVEKIT', color: '#0D74FF', values: [1] },
    ],
    yMax: 140,
    kpis: [{ value: '<1 MiB' }, { value: '50–128× smaller' }],
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
      { label: 'ProveKit', value: '0.37s' },
      { label: 'Barretenberg', value: '0.39s' },
      { label: 'Circom', value: '0.40s' },
      { label: 'One-time setup', value: '2.86s' },
    ],
    notes: [
      'SHA-256 preimage circuit · 52,029 R1CS constraints',
      'Wall clock includes witness generation',
      'Circom measured with native rapidsnark',
    ],
  },
  memory: {
    extraKpis: [
      { label: 'ProveKit', value: '118.9 MiB' },
      { label: 'Barretenberg', value: '157.9 MiB' },
      { label: 'Circom', value: '96.7 MiB' },
      { label: 'Hardware', value: 'M2 Air' },
    ],
    notes: [
      'Peak resident set while proving',
      'Circom measured with native rapidsnark',
      'All three fit comfortably in phone-class memory',
    ],
  },
  artifacts: {
    extraKpis: [
      { label: 'Prover key (.pkp)', value: '426 KiB' },
      { label: 'Verifier key (.pkv)', value: '572 KiB' },
      { label: 'One-time prepare', value: '2.86s' },
      { label: 'Trusted setup', value: 'None' },
    ],
    notes: [
      'Everything a device needs before proving: keys under 1 MiB',
      'Circom additionally needs a 288 MiB ptau for its ceremony',
      'Hash-based WHIR commitment, no trusted setup ceremony',
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
  { label: 'Prove', unit: 's', values: [0.39, 0.4, 0.37], better: 'low' },
  { label: 'Verify', unit: 'ms', values: [10, 1, 50], better: 'low' },
  { label: 'Prove peak RSS', unit: ' MiB', values: [157.9, 96.7, 118.9], better: 'low' },
  { label: 'Verify peak RSS', unit: ' MiB', values: [6, 1.8, 45.9], better: 'low' },
  { label: 'Proof size', unit: ' KiB', values: [14.3, 0.7, 617], better: 'low' },
  { label: 'Prover artifacts', unit: ' MiB', values: [128, 50.9, 1], better: 'low' },
  { label: 'One-time setup', unit: 's', values: [0.37, 46.4, 2.86], better: 'low' },
];

export const SUMMARY_TOOLKITS = [
  { label: 'BARRETENBERG', color: '#DE00FF' },
  { label: 'CIRCOM', color: '#E91900' },
  { label: 'PROVEKIT', color: '#0D74FF' },
] as const;
