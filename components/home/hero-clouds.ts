/**
 * The cloud the hero opens in: a WebGL layer drawn over The Avenue's film.
 *
 * Soft cloud banks, lit from the low sun of the film's sunset shot, that the
 * camera flies through as `c` (0 → 1) advances: each bank swells as it comes
 * closer, parts around the centre and passes, the warm haze behind them thins,
 * and a last bank of low cloud sinks below the tree line, so the towers rise
 * out of it. Everything is procedural (layered noise), so there are no cloud
 * images to load, and it is drawn at reduced resolution — cloud is soft.
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

vec2 gUv;
float gAspect;

// One bank of cloud, premultiplied. q: centred coordinates, x scaled by aspect.
vec4 bank(vec2 q, float scale, vec2 seed, float cover, float soft, vec2 drift, float haze, float contrast, out float n) {
  vec2 p = q * scale + seed + drift;
  vec2 w = vec2(fbm3(p * 0.55 + seed.yx), fbm3(p * 0.55 + seed + 4.3));
  p += (w - 0.5) * 0.75;
  float low;
  n = fbm5(p, low);
  float dens = smoothstep(cover, cover + soft, n);

  // Lit from the low sun: brighter where the cloud thins toward it.
  vec2 sunQ = (uSun - 0.5) * vec2(gAspect, 1.0);
  vec2 toSun = normalize(sunQ - q + vec2(0.0001));
  float ahead = fbm3(p + toSun * 0.16);
  // Floored, so folds read as soft shadow rather than dark creases.
  float lit = clamp(0.6 + (low - ahead) * 3.4 * contrast, 0.24, 1.0);

  vec3 col = mix(vec3(0.56, 0.53, 0.55), vec3(0.86, 0.79, 0.71), smoothstep(0.0, 0.55, lit));
  col = mix(col, vec3(1.0, 0.93, 0.82), smoothstep(0.5, 1.0, lit));
  col *= mix(1.0, 1.0 - 0.1 * contrast, smoothstep(0.6, 1.0, dens));
  float glow = exp(-length((gUv - uSun) * vec2(gAspect, 1.0)) * 2.4);
  col += vec3(1.0, 0.72, 0.38) * glow * (0.35 + 0.45 * (1.0 - dens));
  // Further banks sink into the haze.
  col = mix(col, mix(vec3(0.80, 0.70, 0.60), vec3(0.62, 0.62, 0.66), gUv.y), haze);
  return vec4(col * dens, dens);
}

vec4 over(vec4 front, vec4 back) { return front + back * (1.0 - front.a); }

void main() {
  gUv = gl_FragCoord.xy / uRes;
  gAspect = uRes.x / uRes.y;
  vec2 q = (gUv - 0.5) * vec2(gAspect, 1.0);
  float c = clamp(uC, 0.0, 1.0);
  float t = uTime;

  // A warm haze, behind the banks, that clears as the camera comes through.
  float glow = exp(-length((gUv - uSun) * vec2(gAspect, 1.0)) * 2.0);
  vec3 fogCol = mix(vec3(0.88, 0.80, 0.70), vec3(0.66, 0.64, 0.68), smoothstep(0.15, 1.0, gUv.y));
  fogCol += vec3(1.0, 0.7, 0.35) * glow * 0.35;
  float fogA = (1.0 - smoothstep(0.1, 0.74, c)) * 0.94;
  vec4 acc = vec4(fogCol * fogA, fogA);

  float n;
  // The low cloud the towers rise out of: its top sinks below the tree line.
  float edge = mix(1.3, -0.12, smoothstep(0.42, 0.98, c));
  vec4 sea = bank(q * vec2(0.7, 1.5), 2.3, vec2(3.1, 7.7), 0.34, 0.4, vec2(t * 0.012, 0.0), 0.45, 0.45, n);
  sea *= (1.0 - smoothstep(edge - 0.42, edge + 0.04, gUv.y + (n - 0.5) * 0.3)) * (1.0 - smoothstep(0.88, 1.0, c));
  acc = over(sea, acc);

  // The banks the camera flies through, nearest drawn last.
  for (int i = 2; i >= 0; i--) {
    float fi = float(i);
    float D = 0.32 + fi * 0.36 - c * 1.2 * (1.0 - uCalm);
    // With reduced motion the banks stay put and simply thin away.
    float fade = smoothstep(0.03, 0.26, D) * (1.0 - uCalm * smoothstep(0.1 + fi * 0.2, 0.3 + fi * 0.25, c));
    if (fade <= 0.0) continue;
    vec4 b = bank(q, max(D, 0.03) * 2.9, vec2(11.3 + fi * 5.7, 2.9 + fi * 3.1), 0.38 - fi * 0.02, 0.34,
                  vec2(t * (0.014 + fi * 0.004), t * 0.003), 0.04 + fi * 0.12, 1.15 - fi * 0.2, n);
    // As a bank closes in, it parts around the centre: the way through.
    float open = smoothstep(0.34, 0.06, D) * 1.3;
    float r = length(q * vec2(0.8, 1.25));
    b *= smoothstep(open * 0.7, open * 0.7 + 0.42, r + (n - 0.5) * 0.7);
    acc = over(b * fade, acc);
  }

  // Slightly deeper at the top and foot, for the header and the scroll cue.
  acc.rgb *= 1.0 - 0.16 * smoothstep(0.72, 1.0, gUv.y) - 0.1 * smoothstep(0.22, 0.0, gUv.y);
  // A little dither against banding.
  acc.rgb += (hash(gl_FragCoord.xy + t) - 0.5) / 255.0;
  gl_FragColor = acc;
}`;

const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}";

/** Pixels the clouds are drawn at, at most; the canvas is stretched to fill. */
const MAX_PIXELS = 360_000;

export type Clouds = {
  /** Sizes the drawing buffer for a stage of this CSS size. */
  resize: (w: number, h: number) => void;
  /** c: 0 (all cloud) → 1 (clear). sun: the sun's position on screen, 0..1 with y up. */
  draw: (c: number, time: number, sun: [number, number], calm: boolean) => void;
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

  return {
    resize(w, h) {
      const scale = Math.min(0.6, Math.sqrt(MAX_PIXELS / Math.max(w * h, 1)));
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
    },
    draw(c, time, sun, calm) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uC, c);
      gl.uniform2f(uSun, sun[0], sun[1]);
      gl.uniform1f(uCalm, calm ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
