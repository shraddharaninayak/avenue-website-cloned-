export const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;
export const clamp01 = (v: number) => clamp(v, 0, 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Normalised position of p inside [a,b]. */
export const span = (a: number, b: number, p: number) =>
  clamp01((p - a) / (b - a));
export const smoothstep = (a: number, b: number, p: number) => {
  const t = span(a, b, p);
  return t * t * (3 - 2 * t);
};
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export type Rect = { x: number; y: number; w: number; h: number };

export const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    img.decode().then(
      () => resolve(img),
      () => {
        // decode() rejects on some browsers for images that still load fine.
        if (img.complete && img.naturalWidth > 0) resolve(img);
        else {
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load ${src}`));
        }
      },
    );
  });
