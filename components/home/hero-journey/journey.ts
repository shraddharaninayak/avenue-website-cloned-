import { createCameraTrack, type CameraKey, type CameraPose } from "./camera";
import {
  FrameSequenceScene,
  type FrameSequenceDef,
} from "./frame-sequence-scene";
import {
  LayeredScene,
  blendFrames,
  type Frame,
  type LayeredSceneDef,
  type View,
} from "./layered-scene";
import { easeInOutCubic, lerp, smoothstep, span, type Rect } from "./math";

/**
 * A scroll-driven property journey: an ordered list of shots on one timeline.
 *
 * A shot is a scene plus the scroll span it is on screen for. A layered still
 * is flown with a keyframed camera; a frame sequence (a rendered fly-through)
 * simply plays across its span. Shots overlap where one hands over to the
 * next. Everything is a pure function of scroll progress, so any position,
 * forwards or backwards, renders the same picture.
 *
 * To extend the journey — a new render, a rendered camera path, or later a
 * 3D scene — add a shot to the journey definition; the hero does not change.
 */

export type Chapter = { from: number; label: string };

export type Handoff = {
  /** Scroll span over which the incoming shot takes over. */
  from: number;
  to: number;
  /**
   * The same place seen in both shots. The incoming shot starts exactly on
   * top of it — same position, same size — and pushes in to its own framing
   * while the view opens out from there, so the camera travels into the
   * place instead of cutting to it.
   */
  match?: {
    prev: { layer: string; rect: Rect };
    next: { layer: string; rect: Rect };
  };
};

type ShotBase = { id: string; from: number; to: number; handoff?: Handoff };

export type LayeredShotDef = ShotBase & {
  scene: LayeredSceneDef;
  camera: CameraKey[];
  /**
   * Camera for portrait screens, which see only a narrow slice of a wide
   * render: the path has to choose what that slice lands on.
   */
  portraitCamera?: CameraKey[];
};

export type ShotDef = LayeredShotDef | (ShotBase & { scene: FrameSequenceDef });

export type JourneyDef = { shots: ShotDef[]; chapters: Chapter[] };

type Shot = {
  def: ShotDef;
  scene: LayeredScene | FrameSequenceScene;
  track?: (p: number) => CameraPose;
  portraitTrack?: (p: number) => CameraPose;
};

type Opening = { cx: number; cy: number; rx: number; ry: number; solid: number };

const BACKDROP = "#2D3A1F";
/** Screens narrower than this (width / height) use portrait camera paths. */
const PORTRAIT_BELOW = 0.9;

export class Journey {
  readonly def: JourneyDef;
  private shots: Shot[];

  constructor(def: JourneyDef) {
    this.def = def;
    this.shots = def.shots.map((shot) => {
      if (shot.scene.kind === "frames") {
        return { def: shot, scene: new FrameSequenceScene(shot.scene) };
      }
      const layered = shot as LayeredShotDef;
      return {
        def: shot,
        scene: new LayeredScene(layered.scene),
        track: createCameraTrack(layered.camera),
        portraitTrack: layered.portraitCamera
          ? createCameraTrack(layered.portraitCamera)
          : undefined,
      };
    });
  }

  /** The opening shot first, so the journey can start while the rest arrive. */
  load(onOpeningReady?: () => void) {
    const [first, ...rest] = this.shots;
    return first.scene.load().then(() => {
      onOpeningReady?.();
      return Promise.all(rest.map((s) => s.scene.load().catch(() => {})));
    });
  }

  get ready() {
    return this.shots[0].scene.ready;
  }

  chapterAt(p: number) {
    let index = 0;
    this.def.chapters.forEach((c, i) => {
      if (p >= c.from) index = i;
    });
    return index;
  }

  private frameFor(shot: Shot, p: number, view: View): Frame | null {
    if (!(shot.scene instanceof LayeredScene) || !shot.track) return null;
    const portrait = view.w / view.h < PORTRAIT_BELOW;
    const track = (portrait && shot.portraitTrack) || shot.track;
    return shot.scene.frame(track(p), view);
  }

  private drawShot(ctx: CanvasRenderingContext2D, shot: Shot, p: number, view: View) {
    if (shot.scene instanceof LayeredScene) {
      const frame = this.frameFor(shot, p, view);
      if (frame) shot.scene.draw(ctx, frame, view);
      return frame;
    }
    shot.scene.draw(ctx, span(shot.def.from, shot.def.to, p), view);
    return null;
  }

  render(
    ctx: CanvasRenderingContext2D,
    scratch: CanvasRenderingContext2D,
    p: number,
    view: View,
  ) {
    const bw = view.w * view.dpr;
    const bh = view.h * view.dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = BACKDROP;
    ctx.fillRect(0, 0, bw, bh);

    let i = 0;
    this.shots.forEach((s, j) => {
      if (p >= s.def.from) i = j;
    });
    // A shot that has not loaded yet: keep flying the one before it.
    while (i > 0 && !this.shots[i].scene.ready) i--;
    const shot = this.shots[i];
    if (!shot.scene.ready) return;

    const hand = shot.def.handoff;
    if (i === 0 || !hand || p >= hand.to) {
      this.drawShot(ctx, shot, p, view);
      return;
    }

    const prev = this.shots[i - 1];
    const e = span(hand.from, hand.to, p);
    const prevFrame = this.drawShot(ctx, prev, p, view);

    // Attention narrows a little toward where the camera is heading.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgba(6, 8, 12, ${0.22 * Math.sin(Math.PI * e)})`;
    ctx.fillRect(0, 0, bw, bh);

    scratch.setTransform(1, 0, 0, 1, 0, 0);
    scratch.globalCompositeOperation = "source-over";
    scratch.globalAlpha = 1;
    scratch.imageSmoothingEnabled = true;
    scratch.imageSmoothingQuality = "high";
    scratch.clearRect(0, 0, bw, bh);

    let opening: Opening | null = null;
    const own = this.frameFor(shot, p, view);

    if (
      shot.scene instanceof LayeredScene &&
      prev.scene instanceof LayeredScene &&
      own &&
      prevFrame &&
      hand.match
    ) {
      const anchor = prev.scene.project(
        hand.match.prev.layer,
        hand.match.prev.rect,
        prevFrame,
        view,
      );
      let frame = own;
      if (anchor) {
        const matched = shot.scene.frameMatching(
          hand.match.next.layer,
          hand.match.next.rect,
          anchor,
          own,
          view,
        );
        // The push from the shared place to the shot's own framing.
        frame = blendFrames(matched, own, easeInOutCubic(e));
      }

      const place = shot.scene.project(
        hand.match.next.layer,
        hand.match.next.rect,
        frame,
        view,
      );
      const bounds = shot.scene.bounds(frame, view);
      if (place && bounds) {
        const g = smoothstep(0.1, 1, e);
        const diag = Math.hypot(view.w, view.h);
        const cx = lerp(place.x + place.w / 2, view.w / 2, g);
        const cy = lerp(place.y + place.h * 0.5, view.h / 2, g);
        // The opening may only reach an edge of the incoming render where
        // that edge is on screen, so no straight edge of it is ever seen.
        const room = (edge: number, onScreen: boolean, d: number) =>
          onScreen ? Math.max(d, 0) : Infinity;
        const maxRx = Math.min(
          room(bounds.x, bounds.x > 0, cx - bounds.x),
          room(bounds.x + bounds.w, bounds.x + bounds.w < view.w, bounds.x + bounds.w - cx),
        );
        const maxRy = Math.min(
          room(bounds.y, bounds.y > 0, cy - bounds.y),
          room(bounds.y + bounds.h, bounds.y + bounds.h < view.h, bounds.y + bounds.h - cy),
        );
        const rx = Math.min(lerp(place.w * 0.62, diag, g), maxRx);
        const ry = Math.min(lerp(place.h * 0.9, diag, g), maxRy);
        // However flat the ellipse gets, its edge stays at least this soft.
        const minFeather = Math.min(90, Math.min(view.w, view.h) * 0.12);
        opening = {
          cx,
          cy,
          rx,
          ry,
          solid: Math.max(
            0,
            Math.min(lerp(0.35, 0.8, g), 1 - minFeather / Math.max(Math.min(rx, ry), 1)),
          ),
        };
      }
      shot.scene.draw(scratch, frame, view);
    } else {
      this.drawShot(scratch, shot, p, view);
    }

    if (opening) ellipseMask(scratch, opening, view);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = hand.match ? smoothstep(0, 0.3, e) : e;
    ctx.drawImage(scratch.canvas, 0, 0);
    ctx.globalAlpha = 1;
  }
}

/** Keeps a soft ellipse of what is on the canvas: solid to `solid`, fading to its rim. */
function ellipseMask(c: CanvasRenderingContext2D, o: Opening, view: View) {
  const d = view.dpr;
  const W = view.w * d;
  const H = view.h * d;
  c.globalCompositeOperation = "destination-in";
  if (o.rx < 1 || o.ry < 1) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = "rgba(0,0,0,0)";
    c.fillRect(0, 0, W, H);
  } else {
    c.setTransform(o.rx * d, 0, 0, o.ry * d, o.cx * d, o.cy * d);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(o.solid, "rgba(0,0,0,1)");
    g.addColorStop(o.solid + (1 - o.solid) * 0.5, "rgba(0,0,0,0.5)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    // The whole canvas, expressed in the ellipse's unit space.
    c.fillRect(
      -o.cx / o.rx - 1,
      -o.cy / o.ry - 1,
      view.w / o.rx + 2,
      view.h / o.ry + 2,
    );
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = "source-over";
}
