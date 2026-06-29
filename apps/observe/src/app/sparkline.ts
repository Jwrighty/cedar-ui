export interface SparklineView {
  width: number;
  height: number;
  padding: number;
}

export type SparklinePoint = [number, number];

export function normalizePoints(
  values: number[],
  { width, height, padding }: SparklineView,
): SparklinePoint[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const span = values.length > 1 ? values.length - 1 : 1;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  return values.map((value, index) => {
    const x = padding + (index / span) * innerWidth;
    const y = height - padding - ((value - min) / range) * innerHeight;
    return [round(x), round(y)];
  });
}

export function toSmoothPath(points: SparklinePoint[]): string {
  if (points.length === 0) return "";
  if (points.length < 3) {
    return points
      .map((point, index) => `${index ? "L" : "M"}${point[0]} ${point[1]}`)
      .join(" ");
  }

  // A cubic bézier stays within the convex hull of its control points, so
  // clamping control-point Y to the data envelope stops sharp valleys from
  // overshooting past the min/max and being clipped by the chart bounds.
  const minY = Math.min(...points.map((point) => point[1]));
  const maxY = Math.max(...points.map((point) => point[1]));
  const clampY = (value: number) => Math.min(maxY, Math.max(minY, value));

  let path = `M${points[0]![0]} ${points[0]![1]}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index]!;
    const p1 = points[index]!;
    const p2 = points[index + 1]!;
    const p3 = points[index + 2] ?? p2;

    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = clampY(p1[1] + (p2[1] - p0[1]) / 6);
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = clampY(p2[1] - (p3[1] - p1[1]) / 6);

    path += ` C${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${p2[0]} ${p2[1]}`;
  }

  return path;
}

export function toAreaPath(
  linePath: string,
  points: SparklinePoint[],
  height: number,
): string {
  if (points.length === 0) return "";
  const last = points[points.length - 1]!;
  const first = points[0]!;
  return `${linePath} L${last[0]} ${height} L${first[0]} ${height} Z`;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
