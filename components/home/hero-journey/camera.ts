/**
 * A camera for a layered still (see layered-scene.ts).
 *
 * All distances share the units of the layers' `depth`: the render's own
 * camera sits at 0 and looks down +depth.
 */
export type CameraPose = {
  /** Travel toward the scene. A layer at depth d appears d / (d - dolly) larger. */
  dolly: number;
  /**
   * Sideways / vertical travel, in render pixels as seen at depth 1. Because
   * near layers shift more than far ones, this is what produces parallax.
   * Positive x moves the camera right, positive y moves it down.
   */
  truckX: number;
  truckY: number;
  /** Render point (on the scene's `lookDepth` layer) held at screen centre. */
  lookX: number;
  lookY: number;
  /** Lens zoom over the cover fit. Rotation-like: no parallax. */
  zoom: number;
};

export type CameraKey = CameraPose & {
  /** Scroll progress (0..1) at which the camera is in this pose. */
  at: number;
};

const CHANNELS = ["dolly", "truckX", "truckY", "lookX", "lookY", "zoom"] as const;

/**
 * Monotone cubic interpolation (Fritsch–Carlson) through the keys, channel by
 * channel: velocity is continuous, values never overshoot a key, a repeated
 * value holds perfectly still, and the first and last keys are at rest.
 * Because the result is a pure function of progress, scrolling back up plays
 * the identical move in reverse.
 */
export function createCameraTrack(keys: CameraKey[]) {
  const sorted = [...keys].sort((a, b) => a.at - b.at);
  const xs = sorted.map((k) => k.at);
  const n = sorted.length;

  const tangents = CHANNELS.map((ch) => {
    const ys = sorted.map((k) => k[ch]);
    const d: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      d.push((ys[i + 1] - ys[i]) / Math.max(xs[i + 1] - xs[i], 1e-9));
    }
    const m = new Array<number>(n).fill(0);
    for (let i = 1; i < n - 1; i++) {
      m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    }
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) {
        m[i] = 0;
        m[i + 1] = 0;
        continue;
      }
      const a = m[i] / d[i];
      const b = m[i + 1] / d[i];
      const s = a * a + b * b;
      if (s > 9) {
        const tau = 3 / Math.sqrt(s);
        m[i] = tau * a * d[i];
        m[i + 1] = tau * b * d[i];
      }
    }
    return { ys, m };
  });

  return (p: number): CameraPose => {
    let i = 0;
    if (p <= xs[0]) i = 0;
    else if (p >= xs[n - 1]) i = n - 2;
    else while (i < n - 2 && p > xs[i + 1]) i++;

    const x0 = xs[i];
    const x1 = xs[Math.min(i + 1, n - 1)];
    const h = Math.max(x1 - x0, 1e-9);
    const t = Math.min(Math.max((p - x0) / h, 0), 1);
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    const pose = {} as CameraPose;
    CHANNELS.forEach((ch, c) => {
      const { ys, m } = tangents[c];
      if (n === 1) {
        pose[ch] = ys[0];
        return;
      }
      const j = Math.min(i + 1, n - 1);
      pose[ch] = h00 * ys[i] + h10 * h * m[i] + h01 * ys[j] + h11 * h * m[j];
    });
    return pose;
  };
}
