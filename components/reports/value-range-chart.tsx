/**
 * The three methods, on one euro scale.
 *
 * Ranges rather than bars, because none of these values starts at zero and a
 * bar from zero would say they do. The band behind them is where the two
 * earnings methods overlap, which is the report's actual conclusion: the eye
 * should land on the agreement before it lands on any single figure.
 *
 * Server-rendered SVG. No client JavaScript, so it survives a print to PDF and
 * costs nothing to load. Hover text is native `<title>`, which is honest about
 * what this is: a static figure, not an interactive chart.
 *
 * Palette: categorical slots 1-3 from the house ramp, validated in both modes
 * (worst adjacent CVD ΔE 9.2 light / 9.4 dark, normal-vision 27.6 / 26.5).
 * Aqua sits under 3:1 on the light surface, so every row carries a visible
 * label and its figures in text — identity never rests on colour here.
 */

export type ValueBand = {
  label: string;
  low: number;
  high: number;
  central: number;
  /** A point rather than a range, drawn as a marker only. */
  point?: boolean;
  note?: string;
};

const PAD = { top: 8, right: 16, bottom: 34, left: 152 };
const ROW = 46;
const BAR = 10;

function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min || Math.abs(max) || 1;
  const raw = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? magnitude * 10;
  const first = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let t = first; t <= max + step / 2; t += step) ticks.push(t);
  return ticks;
}

const euro = (amount: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);

const short = (amount: number) =>
  Math.abs(amount) >= 1_000_000
    ? `€${(amount / 1_000_000).toFixed(1)}m`
    : `€${Math.round(amount / 1000)}k`;

export function ValueRangeChart({
  bands,
  agreement,
  caption,
}: {
  bands: ValueBand[];
  agreement?: { low: number; high: number };
  caption?: string;
}) {
  if (bands.length === 0) return null;

  const values = bands.flatMap((b) => [b.low, b.high, b.central]);
  if (agreement) values.push(agreement.low, agreement.high);
  const rawMin = Math.min(...values, 0);
  const rawMax = Math.max(...values);
  const ticks = niceTicks(rawMin, rawMax);
  const min = Math.min(rawMin, ticks[0]);
  const max = Math.max(rawMax, ticks[ticks.length - 1]);

  const width = 720;
  const height = PAD.top + bands.length * ROW + PAD.bottom;
  const plot = width - PAD.left - PAD.right;
  const x = (value: number) => PAD.left + ((value - min) / (max - min || 1)) * plot;

  return (
    <figure className="viz-root my-10 not-prose">
      <style>{`
        .viz-root{--viz-surface:#fcfcfb;--viz-ink:#0b0b0b;--viz-muted:#52514e;
          --viz-grid:#e4e3df;--viz-band:#2a78d61f;
          --s1:#2a78d6;--s2:#eb6834;--s3:#1baf7a}
        @media (prefers-color-scheme: dark){:root:where(:not([data-theme="light"])) .viz-root{
          --viz-surface:#1a1a19;--viz-ink:#ffffff;--viz-muted:#c3c2b7;
          --viz-grid:#33322f;--viz-band:#3987e528;
          --s1:#3987e5;--s2:#d95926;--s3:#199e70}}
        :root[data-theme="dark"] .viz-root{
          --viz-surface:#1a1a19;--viz-ink:#ffffff;--viz-muted:#c3c2b7;
          --viz-grid:#33322f;--viz-band:#3987e528;
          --s1:#3987e5;--s2:#d95926;--s3:#199e70}
      `}</style>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Valuation range per method. ${bands
          .map((b) => `${b.label}: ${b.point ? euro(b.central) : `${euro(b.low)} to ${euro(b.high)}`}`)
          .join(". ")}`}
        className="w-full"
      >
        {agreement ? (
          <rect
            x={x(agreement.low)}
            y={PAD.top}
            width={Math.max(2, x(agreement.high) - x(agreement.low))}
            height={bands.length * ROW - 8}
            fill="var(--viz-band)"
          >
            <title>{`Both earnings methods land between ${euro(agreement.low)} and ${euro(agreement.high)}`}</title>
          </rect>
        ) : null}

        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={x(t)}
              x2={x(t)}
              y1={PAD.top}
              y2={height - PAD.bottom}
              stroke="var(--viz-grid)"
              strokeWidth={1}
            />
            <text
              x={x(t)}
              y={height - PAD.bottom + 18}
              textAnchor="middle"
              fontSize={11}
              fill="var(--viz-muted)"
            >
              {short(t)}
            </text>
          </g>
        ))}

        {bands.map((band, i) => {
          const cy = PAD.top + i * ROW + ROW / 2 - 6;
          const colour = `var(--s${(i % 3) + 1})`;
          return (
            <g key={band.label}>
              <text
                x={PAD.left - 12}
                y={cy + 4}
                textAnchor="end"
                fontSize={12}
                fill="var(--viz-ink)"
              >
                {band.label}
              </text>

              {band.point ? null : (
                <rect
                  x={x(band.low)}
                  y={cy - BAR / 2}
                  width={Math.max(BAR, x(band.high) - x(band.low))}
                  height={BAR}
                  rx={4}
                  fill={colour}
                >
                  <title>{`${band.label}: ${euro(band.low)} to ${euro(band.high)}`}</title>
                </rect>
              )}

              <circle
                cx={x(band.central)}
                cy={cy}
                r={5}
                fill={colour}
                stroke="var(--viz-surface)"
                strokeWidth={2}
              >
                <title>{`${band.label}: ${euro(band.central)}`}</title>
              </circle>

              <text x={PAD.left - 12} y={cy + 20} textAnchor="end" fontSize={11} fill="var(--viz-muted)">
                {band.point ? euro(band.central) : `${euro(band.low)} – ${euro(band.high)}`}
              </text>
            </g>
          );
        })}
      </svg>

      {caption ? (
        <figcaption className="mt-3 text-sm text-muted-foreground">{caption}</figcaption>
      ) : null}

      {/* The table is the accessible equal of the figure, not a fallback. */}
      <table className="mt-6 w-full text-sm">
        <thead className="border-b border-border text-left text-muted-foreground">
          <tr>
            <th className="py-2 pr-4 font-medium">Method</th>
            <th className="py-2 pr-4 text-right font-medium">Low</th>
            <th className="py-2 pr-4 text-right font-medium">Central</th>
            <th className="py-2 text-right font-medium">High</th>
          </tr>
        </thead>
        <tbody>
          {bands.map((band) => (
            <tr key={band.label} className="border-b border-border/60">
              <td className="py-2 pr-4">{band.label}</td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {band.point ? "—" : euro(band.low)}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums">{euro(band.central)}</td>
              <td className="py-2 text-right tabular-nums">
                {band.point ? "—" : euro(band.high)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
