/**
 * The cloud the hero opens in: a WebGL layer drawn over The Avenue's film.
 *
 * The flow follows the reference (kinfra.in), driven by scroll (`c`, 0 → 1):
 *
 *   0    – 0.52  in the clouds. Towering cumulus fill the screen, lit gold by
 *                a low sun beyond the upper left, cool in their shadows, with
 *                shafts of light streaming through. The camera flies slowly
 *                forward into them.
 *   0.50 – 0.80  the dissolve. The cloud thins — from the towers outward —
 *                into a warm haze, and the film's towers appear through it.
 *   0.62 – 1     the haze clears; low cloud lies at the towers' feet, then
 *                sinks below the tree line.
 *
 * The cumulus are volumetric: each pixel marches a ray through a 3D field of
 * cloud and lights it from the sun, so the heaps glow at their edges and
 * shade themselves the way real cloud does. The 3D noise comes from a small
 * generated texture (one lookup per sample); the layer is drawn at reduced
 * resolution, and lower still on a device that cannot keep up.
 */

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform float uC;
uniform vec2 uSun;
uniform float uCalm;
uniform vec2 uFocus;
uniform float uTree;
uniform float uFloor;
uniform sampler2D uNoise;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
const mat2 ROT = mat2(1.6, 1.2, -1.2, 1.6);
float fbm3(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { s += a * noise(p); p = ROT * p + vec2(1.7, 9.2); a *= 0.5; }
  return s;
}
// Five octaves; the first three are also returned in 'low', for lighting.
float fbm5(vec2 p, out float low) {
  float s = 0.0, a = 0.5;
  low = 0.0;
  for (int i = 0; i < 5; i++) {
    s += a * noise(p);
    if (i == 2) low = s;
    p = ROT * p + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
}
// Value noise in 3D from one texture lookup: the texture's green channel is
// its red channel offset by (37, 239), so one lookup returns two neighbouring
// z-slices, and the hardware blends x and y.
float noise3(vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  vec2 uv = (p.xy + vec2(37.0, 239.0) * p.z) + f.xy;
  vec2 rg = texture2D(uNoise, (uv + 0.5) / 256.0).yx;
  return mix(rg.x, rg.y, f.z);
}

// The cloud: a layer of cumulus whose heaps rise to about the camera's
// height, thinning above it and drifting slowly.
float cloudField(vec3 p) {
  vec3 q = p * 0.34 + vec3(uTime * 0.012, 0.0, 0.0);
  float f = 0.5 * noise3(q); q *= 2.02;
  f += 0.25 * noise3(q); q *= 2.03;
  f += 0.125 * noise3(q); q *= 2.01;
  f += 0.0625 * noise3(q); q *= 2.02;
  f += 0.03125 * noise3(q);
  return clamp(f * 2.5 - 0.98 - p.y * 0.15, 0.0, 1.0);
}

vec2 gUv;
float gAspect;

// The low sun of the cloud: beyond the upper left of the screen.
const vec2 LIGHT = vec2(-0.12, 1.18);

float sunGlow(float k) {
  return exp(-length((gUv - uSun) * vec2(gAspect, 1.0)) * k);
}
float lightGlow(float k) {
  return exp(-length((gUv - LIGHT) * vec2(gAspect, 1.0)) * k);
}

// The low sun of the cloud, beyond the upper left of the screen.
const vec3 SUN_DIR = vec3(-0.78, 0.44, 0.44);

// The golden sky behind the cloud, brightest toward the sun.
vec3 skyBehind(vec3 rd, vec3 sd) {
  vec3 col = mix(vec3(1.0, 0.78, 0.5), vec3(0.66, 0.64, 0.72), clamp(rd.y * 1.3 + 0.2, 0.0, 1.0));
  float s = clamp(dot(rd, sd), 0.0, 1.0);
  return col + vec3(1.0, 0.68, 0.36) * (pow(s, 5.0) * 0.55 + pow(s, 40.0) * 0.6);
}

// Flying into the cumulus: the colour along one ray, opaque.
vec3 cumulus(vec2 q, float travel) {
  vec3 sd = normalize(SUN_DIR);
  vec3 ro = vec3(0.0, 1.6, travel);
  vec3 rd = normalize(vec3(q.x * 0.95, q.y * 0.95 - 0.3, 1.0));
  vec3 bg = skyBehind(rd, sd);
  vec4 sum = vec4(0.0);
  float t = 0.3;
  for (int i = 0; i < 48; i++) {
    if (sum.a > 0.985 || t > 30.0) break;
    float dt = max(0.1, 0.05 * t);
    vec3 pos = ro + t * rd;
    float den = cloudField(pos);
    if (den > 0.01) {
      // Lit where the cloud thins toward the sun: glowing edges, shadowed bellies.
      float dif = clamp((den - cloudField(pos + 0.5 * sd)) / 0.5, 0.0, 1.0);
      vec3 lin = vec3(1.0, 0.6, 0.3) * dif * 2.4 + vec3(0.64, 0.6, 0.74) * 0.76;
      vec3 col = mix(vec3(1.0, 0.95, 0.87), vec3(0.36, 0.33, 0.44), den) * lin;
      // Further cloud sinks into the haze.
      col = mix(col, bg, 1.0 - exp(-0.0012 * t * t));
      float a = 1.0 - exp(-den * dt * 2.4);
      sum += vec4(col * a, a) * (1.0 - sum.a);
    }
    t += dt;
  }
  vec3 col = sum.rgb + bg * (1.0 - sum.a);
  // Glare from the sun beyond the corner.
  col += vec3(1.0, 0.62, 0.3) * 0.22 * pow(clamp(dot(rd, sd), 0.0, 1.0), 3.0);
  return col;
}

// Low cloud, premultiplied, lit by the film's own sun.
vec4 mist(vec2 p, out float n) {
  vec2 w = vec2(fbm3(p * 0.5), fbm3(p * 0.5 + 4.3));
  p += (w - 0.5) * 0.9;
  float low;
  n = fbm5(p + vec2(3.1, 7.7), low);
  float dens = smoothstep(0.34, 0.64, n);
  vec2 toSun = normalize((uSun - gUv) * vec2(gAspect, 1.0) + vec2(0.0, 0.5));
  float ahead = fbm3(p + vec2(3.1, 7.7) + toSun * 0.17);
  float lit = clamp(0.6 + (low - ahead) * 1.8, 0.2, 1.0);
  vec3 col = mix(vec3(0.46, 0.44, 0.53), vec3(0.82, 0.72, 0.69), smoothstep(0.0, 0.55, lit));
  col = mix(col, vec3(1.0, 0.9, 0.76), smoothstep(0.55, 1.0, lit));
  col += vec3(1.0, 0.68, 0.36) * sunGlow(2.6) * (0.2 + 0.55 * (1.0 - dens));
  return vec4(col * dens, dens);
}

vec4 over(vec4 front, vec4 back) { return front + back * (1.0 - front.a); }

void main() {
  gUv = gl_FragCoord.xy / uRes;
  gAspect = uRes.x / uRes.y;
  // Centred, in units of the screen's shorter side.
  vec2 q = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  float c = clamp(uC, 0.0, 1.0);
  float move = 1.0 - uCalm;
  float n;

  // ---- The low cloud at the towers' feet, sinking below the tree line.
  vec4 acc = vec4(0.0);
  float edge = mix(uTree + 0.16, uTree - 0.6, smoothstep(0.55, 0.98, c));
  if (gUv.y < edge + 0.08 && c > 0.4) {
    vec4 m = mist(vec2(q.x * 1.8 + uTime * 0.012, gUv.y * 3.2), n);
    m *= 1.0 - smoothstep(-0.05, 0.03, gUv.y - edge + (n - 0.5) * 0.22);
    m *= vec4(0.8, 0.76, 0.76, 0.9) * smoothstep(uFloor - 0.02, uFloor + 0.1, gUv.y);
    acc = m * (1.0 - smoothstep(0.86, 1.0, c));
  }

  // ---- The warm haze the cloud dissolves into, clearing from the towers.
  float haze = smoothstep(0.42, 0.58, c) * (1.0 - smoothstep(0.66, 0.96, c));
  if (haze > 0.0) {
    float hn = fbm3(q * 1.6 + vec2(uTime * 0.01, 0.0));
    vec3 hc = mix(vec3(0.72, 0.66, 0.66), vec3(1.0, 0.85, 0.66), lightGlow(1.1));
    float ha = haze * clamp(0.78 + (hn - 0.5) * 0.5 + length(gUv - uFocus) * 0.2, 0.0, 1.0);
    acc = over(vec4(hc * ha, ha), acc);
  }

  // ---- The cloud, flown slowly into; it thins from the towers outward.
  float gone = smoothstep(0.5, 0.8, c + (fbm3(q * 2.2) - 0.5) * 0.14 + (0.35 - length((gUv - uFocus) * vec2(gAspect, 1.0))) * 0.12);
  if (gone < 1.0) {
    // Framed like a film: the height fixes the view, a narrow screen crops it.
    vec2 fq = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    vec4 cl = vec4(cumulus(fq, c * 7.5 * move + uTime * 0.02), 1.0);

    // Broad shafts of light from the sun beyond the corner, strengthening as
    // the camera goes deeper.
    vec2 d = (gUv - LIGHT) * vec2(gAspect, 1.0);
    float ang = atan(d.y, d.x);
    float rays = smoothstep(0.42, 0.78, noise(vec2(ang * 7.0, 3.1)) * 0.7 + noise(vec2(ang * 17.0, 8.3)) * 0.3);
    rays *= exp(-length(d) * 1.15) * mix(0.3, 1.0, smoothstep(0.1, 0.45, c));
    cl.rgb += vec3(1.0, 0.84, 0.6) * rays * 0.26;

    acc = over(cl * (1.0 - gone), acc);
  }

  // A little dither against banding.
  acc.rgb += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
  gl_FragColor = acc;
}`;

const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}";

/** Pixels the clouds are drawn at, at most; the canvas is stretched to fill. */
const MAX_PIXELS = 170_000;
/** The share of that a slow device may fall back to, at the least. */
const MIN_QUALITY = 0.3;

/**
 * The noise texture: random red, and green = red shifted by (37, 239), which
 * is what noise3() in the shader relies on. Seeded, so it is the same cloud
 * every visit.
 */
function noiseTexture(): Uint8Array {
  const N = 256;
  const red = new Uint8Array(N * N);
  let seed = 1_234_567;
  for (let i = 0; i < red.length; i++) {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
    red[i] = seed >>> 24;
  }
  const px = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = y * N + x;
      px[i * 4] = red[i];
      px[i * 4 + 1] = red[((y - 239) & 255) * N + ((x - 37) & 255)];
      px[i * 4 + 3] = 255;
    }
  }
  return px;
}

export type Clouds = {
  /** Sizes the drawing buffer for a stage of this CSS size. */
  resize: (w: number, h: number) => void;
  /** Draws at a lower resolution from now on; false once at the least. */
  degrade: () => boolean;
  /**
   * c: 0 (sky) → 1 (clear). sun, focus: points on screen, 0..1 with y up —
   * the sun, and where the towers stand. tree, floor: heights on screen, 0..1
   * from the bottom — the tree line, and the foot of the film's frame.
   */
  draw: (
    c: number,
    time: number,
    sun: [number, number],
    focus: [number, number],
    tree: number,
    floor: number,
    calm: boolean,
  ) => void;
  dispose: () => void;
};

export function createClouds(canvas: HTMLCanvasElement): Clouds | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // One triangle covering the screen.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, "uRes");
  const uTime = gl.getUniformLocation(program, "uTime");
  const uC = gl.getUniformLocation(program, "uC");
  const uSun = gl.getUniformLocation(program, "uSun");
  const uCalm = gl.getUniformLocation(program, "uCalm");
  const uFocus = gl.getUniformLocation(program, "uFocus");
  const uTree = gl.getUniformLocation(program, "uTree");
  const uFloor = gl.getUniformLocation(program, "uFloor");

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, noiseTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.uniform1i(gl.getUniformLocation(program, "uNoise"), 0);

  let size = { w: 1, h: 1 };
  let quality = 1;
  const fit = () => {
    const { w, h } = size;
    // Phones draw at a little less: the cloud is soft, and the GPU smaller.
    const cap = Math.min(w, h) < 600 ? 0.5 : 0.6;
    const scale = Math.min(cap, Math.sqrt(MAX_PIXELS / Math.max(w * h, 1))) * quality;
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
  };

  return {
    resize(w, h) {
      size = { w, h };
      fit();
    },
    degrade() {
      if (quality <= MIN_QUALITY) return false;
      quality = Math.max(MIN_QUALITY, quality * 0.8);
      fit();
      return true;
    },
    draw(c, time, sun, focus, tree, floor, calm) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uC, c);
      gl.uniform2f(uSun, sun[0], sun[1]);
      gl.uniform2f(uFocus, focus[0], focus[1]);
      gl.uniform1f(uTree, tree);
      gl.uniform1f(uFloor, floor);
      gl.uniform1f(uCalm, calm ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
