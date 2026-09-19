import type { JourneyDef } from "./journey";

/**
 * The Avenue arrival journey.
 *
 *   0 – 50%   the approach      toward both towers, the near ground passing beneath
 *  50 – 65%   tower scale       crowns in frame, nearly still, the towers parting
 *  65 – 78%   the descent       tilting down the facade toward the podium
 *  78 – 88%   the entrance      the street-level render opens out of the podium
 *  88 – 100%  arrival           at the Milestone porte-cochère
 *
 * Sources (both evening renders of the development):
 *   approach  — eye-level view of the two towers, 2428 × 1366
 *   entrance  — street-level view of the porte-cochère and podium, 2429 × 1366
 *
 * Each render is cut into depth layers (coordinates in render pixels). Layers
 * behind others were filled where a nearer layer used to hide them, so moving
 * the camera uncovers image rather than holes. The approach's far layer is
 * extended past the render — sky above, foliage below — so the camera can
 * look up at the crowns and down at the podium.
 *
 * Depths share units with camera `dolly` and `truck`. The camera never takes
 * a layer much past ~1.4× the render's own detail; the close-up comes from
 * the entrance render, not from magnifying the far one.
 *
 * To upgrade the journey, replace or add shots — for example a rendered
 * fly-through as `{ scene: { kind: "frames", … } }`. Nothing else changes.
 */

const APPROACH = "/hero-journey/approach";
const ENTRANCE = "/hero-journey/entrance";

export const avenueJourney: JourneyDef = {
  chapters: [
    { from: 0, label: "The approach" },
    { from: 0.5, label: "Tower scale" },
    { from: 0.65, label: "The descent" },
    { from: 0.78, label: "The entrance" },
    { from: 0.9, label: "Arrival" },
  ],
  shots: [
    {
      id: "approach",
      from: 0,
      to: 0.88,
      scene: {
        kind: "layered",
        width: 2428,
        height: 1366,
        lookDepth: 3,
        layers: [
          { id: "far", src: `${APPROACH}-far.webp`, x: 0, y: -300, w: 2428, h: 2366, depth: 15 },
          { id: "east", src: `${APPROACH}-east.webp`, x: 1446, y: 473, w: 332, h: 639, depth: 4 },
          { id: "west", src: `${APPROACH}-west.webp`, x: 586, y: 127, w: 681, h: 1089, depth: 3 },
          {
            id: "ground",
            src: `${APPROACH}-ground.webp`,
            x: 0,
            y: 1018,
            w: 2428,
            h: 348,
            depth: 1.3,
            passFade: [1.45, 2.5],
          },
        ],
      },
      camera: [
        // Far off: the whole development in its setting.
        { at: 0, dolly: 0, truckX: 0, truckY: 0, lookX: 1214, lookY: 683, zoom: 1 },
        { at: 0.1, dolly: 0.07, truckX: 20, truckY: 0, lookX: 1200, lookY: 672, zoom: 1 },
        // Closing in; the road and trees fall away beneath the camera.
        { at: 0.3, dolly: 0.5, truckX: 60, truckY: -20, lookX: 1140, lookY: 630, zoom: 1 },
        { at: 0.5, dolly: 0.9, truckX: 90, truckY: -30, lookX: 1070, lookY: 600, zoom: 1 },
        // Tower scale: crowns in frame, nearly still, drifting so the towers part.
        { at: 0.58, dolly: 0.95, truckX: 20, truckY: -30, lookX: 1060, lookY: 590, zoom: 1 },
        { at: 0.65, dolly: 1, truckX: -60, truckY: -10, lookX: 1040, lookY: 640, zoom: 1 },
        // Down the facade toward the podium.
        { at: 0.72, dolly: 1.1, truckX: -120, truckY: 80, lookX: 940, lookY: 900, zoom: 1 },
        { at: 0.78, dolly: 1.2, truckX: -160, truckY: 140, lookX: 850, lookY: 1060, zoom: 1 },
        { at: 0.88, dolly: 1.42, truckX: -180, truckY: 170, lookX: 810, lookY: 1150, zoom: 1 },
      ],
      portraitCamera: [
        // A narrow screen starts wider, the main tower whole and standing in
        // its sky — the extended far layer leaves room to pull back.
        { at: 0, dolly: 0, truckX: 0, truckY: 0, lookX: 930, lookY: 640, zoom: 0.8 },
        { at: 0.3, dolly: 0.4, truckX: 20, truckY: -10, lookX: 940, lookY: 630, zoom: 0.92 },
        { at: 0.5, dolly: 0.7, truckX: 40, truckY: -20, lookX: 1010, lookY: 540, zoom: 1 },
        // Tower scale: across to where the two towers part.
        { at: 0.58, dolly: 0.75, truckX: 60, truckY: -20, lookX: 1300, lookY: 580, zoom: 1 },
        { at: 0.65, dolly: 0.8, truckX: 80, truckY: -10, lookX: 1400, lookY: 640, zoom: 1 },
        // Back across and down the main tower to its podium.
        { at: 0.72, dolly: 0.95, truckX: -40, truckY: 80, lookX: 1060, lookY: 900, zoom: 1 },
        { at: 0.78, dolly: 1.1, truckX: -120, truckY: 140, lookX: 840, lookY: 1080, zoom: 1 },
        { at: 0.88, dolly: 1.3, truckX: -140, truckY: 170, lookX: 800, lookY: 1150, zoom: 1 },
      ],
    },
    {
      id: "entrance",
      from: 0.78,
      to: 1,
      handoff: {
        from: 0.78,
        to: 0.88,
        match: {
          // The podium — porte-cochère to the last shopfront — in each render.
          prev: { layer: "west", rect: { x: 589, y: 1120, w: 425, h: 83 } },
          next: { layer: "building", rect: { x: 304, y: 622, w: 1481, h: 593 } },
        },
      },
      scene: {
        kind: "layered",
        width: 2429,
        height: 1366,
        lookDepth: 3,
        layers: [
          { id: "far", src: `${ENTRANCE}-far.webp`, x: 0, y: 0, w: 2429, h: 1366, depth: 12 },
          { id: "building", src: `${ENTRANCE}-building.webp`, x: 0, y: 0, w: 2429, h: 1366, depth: 3 },
          { id: "props", src: `${ENTRANCE}-props.webp`, x: 163, y: 683, w: 2266, h: 664, depth: 1.3 },
        ],
      },
      camera: [
        { at: 0.78, dolly: 0, truckX: 0, truckY: 0, lookX: 1045, lookY: 900, zoom: 1.12 },
        { at: 0.88, dolly: 0.04, truckX: 0, truckY: 0, lookX: 1045, lookY: 900, zoom: 1.12 },
        // Arrival: the last few steps toward the porte-cochère.
        { at: 0.95, dolly: 0.14, truckX: -20, truckY: 0, lookX: 960, lookY: 880, zoom: 1.08 },
        { at: 1, dolly: 0.2, truckX: -30, truckY: 0, lookX: 920, lookY: 870, zoom: 1.06 },
      ],
      portraitCamera: [
        // On a narrow screen the arrival is the MILESTONE porte-cochère itself.
        { at: 0.78, dolly: 0, truckX: 0, truckY: 0, lookX: 760, lookY: 860, zoom: 1 },
        { at: 0.88, dolly: 0.04, truckX: 0, truckY: 0, lookX: 760, lookY: 860, zoom: 1 },
        // Sign held in the upper half, clear of the arrival message.
        { at: 0.95, dolly: 0.12, truckX: -10, truckY: 0, lookX: 720, lookY: 960, zoom: 1 },
        { at: 1, dolly: 0.18, truckX: -20, truckY: 0, lookX: 700, lookY: 1010, zoom: 1 },
      ],
    },
  ],
};
