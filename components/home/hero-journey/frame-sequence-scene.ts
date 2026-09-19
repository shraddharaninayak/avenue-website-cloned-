import { clamp01, loadImage } from "./math";
import type { View } from "./layered-scene";

/**
 * A pre-rendered camera move, scrubbed by scroll.
 *
 * This is the drop-in for a true fly-through: export the camera path from the
 * 3D model (Blender, Lumion, Twinmotion, Unreal…) as numbered stills and give
 * the shot a `frames` scene. Each frame is drawn cover-fit; scroll position
 * picks the frame, so reversing is free. Frames load first-last-middle-and-
 * so-on, so any scroll position has a near neighbour early.
 */
export type FrameSequenceDef = {
  kind: "frames";
  width: number;
  height: number;
  count: number;
  /** URL of frame `index` (0-based). */
  src: (index: number) => string;
};

export class FrameSequenceScene {
  readonly def: FrameSequenceDef;
  private frames: (HTMLImageElement | undefined)[];
  ready = false;

  constructor(def: FrameSequenceDef) {
    this.def = def;
    this.frames = new Array(def.count);
  }

  /** Resolves once the first frame is in; the rest keep streaming. */
  load() {
    const { count } = this.def;
    const order: number[] = [];
    const seen = new Set<number>();
    for (let step = count - 1; step >= 1; step = Math.floor(step / 2)) {
      for (let i = 0; i < count; i += step) {
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
      }
      if (step === 1) break;
    }
    for (let i = 0; i < count; i++) if (!seen.has(i)) order.push(i);

    const fetchOne = (i: number) =>
      loadImage(this.def.src(i)).then((img) => {
        this.frames[i] = img;
      });

    const first = fetchOne(order[0]);
    void (async () => {
      for (const i of order.slice(1)) await fetchOne(i).catch(() => {});
    })();
    return first.then(() => {
      this.ready = true;
    });
  }

  /** Draws the frame for local progress t (0..1), falling back to the nearest loaded one. */
  draw(ctx: CanvasRenderingContext2D, t: number, view: View) {
    const target = Math.round(clamp01(t) * (this.def.count - 1));
    let img: HTMLImageElement | undefined;
    for (let d = 0; d < this.def.count && !img; d++) {
      img = this.frames[target - d] ?? this.frames[target + d];
    }
    if (!img) return;
    const s = Math.max(view.w / this.def.width, view.h / this.def.height);
    const w = this.def.width * s;
    const h = this.def.height * s;
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    ctx.drawImage(img, (view.w - w) / 2, (view.h - h) / 2, w, h);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
