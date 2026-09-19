import type { CameraPose } from "./camera";
import { clamp, loadImage, smoothstep, type Rect } from "./math";

/**
 * A still render split into depth layers, flown through with a real
 * perspective camera.
 *
 * Every layer is a flat plane parallel to the render's image plane, placed at
 * its own `depth`. Moving the camera by (truckX, truckY, dolly) projects each
 * plane exactly as a pinhole camera would:
 *
 *   scale  = depth / (depth - dolly)
 *   offset = -truck / (depth - dolly)
 *
 * so near layers grow and slide faster than far ones. That difference is the
 * depth the eye reads; it comes from geometry, not from animating each layer
 * by hand. Planes stay rigid, so architecture keeps its proportions.
 */

export type SceneLayer = Rect & {
  id: string;
  src: string;
  /** Distance from the render's camera, in the units camera poses use. */
  depth: number;
  /**
   * For near layers: the magnification range over which the layer fades out
   * as the camera passes it, so it slips away underneath instead of being
   * blown up past the detail the render holds.
   */
  passFade?: [number, number];
};

export type LayeredSceneDef = {
  kind: "layered";
  /** Size of the render the layers were cut from, in render pixels. */
  width: number;
  height: number;
  /** Depth that a pose's lookX / lookY is measured on. */
  lookDepth: number;
  /** Back to front. The first layer must be opaque and span the render. */
  layers: SceneLayer[];
};

export type View = { w: number; h: number; dpr: number };

/** A pose resolved for one screen: lens scale and pan, plus the travel. */
export type Frame = {
  k: number;
  panX: number;
  panY: number;
  dolly: number;
  truckX: number;
  truckY: number;
};

/** A layer closer than this has passed the camera and is not drawn. */
const NEAR_CLIP = 0.12;
/** A little spare image around the frame, so small moves never show an edge. */
const OVERSCAN = 1.02;

export class LayeredScene {
  readonly def: LayeredSceneDef;
  private images = new Map<string, HTMLImageElement>();
  ready = false;

  constructor(def: LayeredSceneDef) {
    this.def = def;
  }

  load() {
    return Promise.all(
      this.def.layers.map((layer) =>
        loadImage(layer.src).then((img) => {
          this.images.set(layer.id, img);
        }),
      ),
    ).then(() => {
      this.ready = true;
    });
  }

  private baseScale(view: View) {
    return (
      Math.max(view.w / this.def.width, view.h / this.def.height) * OVERSCAN
    );
  }

  private layer(id: string) {
    const layer = this.def.layers.find((l) => l.id === id);
    if (!layer) throw new Error(`Unknown layer "${id}"`);
    return layer;
  }

  /** Resolves a pose for this screen, keeping the back layer over the whole view. */
  frame(pose: CameraPose, view: View): Frame {
    const { width, height, lookDepth } = this.def;
    const rel = Math.max(lookDepth - pose.dolly, NEAR_CLIP);
    const s = lookDepth / rel;
    return this.cover(
      {
        k: this.baseScale(view) * pose.zoom,
        panX: s * (pose.lookX - width / 2) - pose.truckX / rel,
        panY: s * (pose.lookY - height / 2) - pose.truckY / rel,
        dolly: pose.dolly,
        truckX: pose.truckX,
        truckY: pose.truckY,
      },
      view,
    );
  }

  /**
   * Nudges lens and pan just enough that the back layer spans the view. The
   * back layer may be larger than the render (extended sky, say), which is
   * what gives the camera room to look past the render's own frame.
   */
  cover(f: Frame, view: View): Frame {
    const back = this.def.layers[0];
    const rel = Math.max(back.depth - f.dolly, NEAR_CLIP);
    const s = back.depth / rel;
    const k = Math.max(f.k, view.w / (s * back.w), view.h / (s * back.h));
    const cx = this.def.width / 2;
    const cy = this.def.height / 2;
    const offX = -f.truckX / rel;
    const offY = -f.truckY / rel;
    const loX = offX + s * (back.x - cx) + view.w / (2 * k);
    const hiX = offX + s * (back.x + back.w - cx) - view.w / (2 * k);
    const loY = offY + s * (back.y - cy) + view.h / (2 * k);
    const hiY = offY + s * (back.y + back.h - cy) - view.h / (2 * k);
    return {
      ...f,
      k,
      panX: loX > hiX ? (loX + hiX) / 2 : clamp(f.panX, loX, hiX),
      panY: loY > hiY ? (loY + hiY) / 2 : clamp(f.panY, loY, hiY),
    };
  }

  /** Screen transform of a layer: screen = (x, y) + scale * renderPixel. */
  transform(layer: SceneLayer, f: Frame, view: View) {
    const rel = layer.depth - f.dolly;
    if (rel <= NEAR_CLIP) return null;
    const s = layer.depth / rel;
    return {
      scale: f.k * s,
      x: view.w / 2 + f.k * (-f.truckX / rel - f.panX - (s * this.def.width) / 2),
      y: view.h / 2 + f.k * (-f.truckY / rel - f.panY - (s * this.def.height) / 2),
    };
  }

  /** Where a rect on a layer lands on screen. */
  project(layerId: string, rect: Rect, f: Frame, view: View): Rect | null {
    const t = this.transform(this.layer(layerId), f, view);
    if (!t) return null;
    return {
      x: t.x + t.scale * rect.x,
      y: t.y + t.scale * rect.y,
      w: t.scale * rect.w,
      h: t.scale * rect.h,
    };
  }

  /**
   * The frame (keeping `like`'s travel) that puts a rect on a layer exactly
   * over a target on screen: matched by width, centred horizontally and
   * standing on the target's bottom edge.
   */
  frameMatching(
    layerId: string,
    rect: Rect,
    target: Rect,
    like: Frame,
    view: View,
  ): Frame {
    const layer = this.layer(layerId);
    const rel = Math.max(layer.depth - like.dolly, NEAR_CLIP);
    const s = layer.depth / rel;
    const k = target.w / (s * rect.w);
    const { width, height } = this.def;
    return {
      ...like,
      k,
      panX:
        -like.truckX / rel -
        (s * width) / 2 +
        s * (rect.x + rect.w / 2) -
        (target.x + target.w / 2 - view.w / 2) / k,
      panY:
        -like.truckY / rel -
        (s * height) / 2 +
        s * (rect.y + rect.h) -
        (target.y + target.h - view.h / 2) / k,
    };
  }

  /** Screen rect covered by the back layer. */
  bounds(f: Frame, view: View): Rect | null {
    const back = this.def.layers[0];
    return this.project(back.id, back, f, view);
  }

  draw(ctx: CanvasRenderingContext2D, f: Frame, view: View) {
    for (const layer of this.def.layers) {
      const img = this.images.get(layer.id);
      if (!img) continue;
      const t = this.transform(layer, f, view);
      if (!t) continue;
      const alpha = layer.passFade
        ? 1 - smoothstep(layer.passFade[0], layer.passFade[1], t.scale / f.k)
        : 1;
      if (alpha <= 0.002) continue;
      // Skip layers that have travelled entirely out of frame.
      const x0 = t.x + t.scale * layer.x;
      const y0 = t.y + t.scale * layer.y;
      const x1 = x0 + t.scale * layer.w;
      const y1 = y0 + t.scale * layer.h;
      if (x1 < 0 || y1 < 0 || x0 > view.w || y0 > view.h) continue;
      ctx.setTransform(
        view.dpr * t.scale,
        0,
        0,
        view.dpr * t.scale,
        view.dpr * t.x,
        view.dpr * t.y,
      );
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, layer.x, layer.y, layer.w, layer.h);
    }
    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}

/** Log-space blend of lens scale, linear blend of pan: a smooth camera between two frames. */
export function blendFrames(a: Frame, b: Frame, t: number): Frame {
  return {
    k: Math.exp(Math.log(a.k) + (Math.log(b.k) - Math.log(a.k)) * t),
    panX: a.panX + (b.panX - a.panX) * t,
    panY: a.panY + (b.panY - a.panY) * t,
    dolly: a.dolly + (b.dolly - a.dolly) * t,
    truckX: a.truckX + (b.truckX - a.truckX) * t,
    truckY: a.truckY + (b.truckY - a.truckY) * t,
  };
}
