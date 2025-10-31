/**
 * 3D Simplex Noise and Curl Noise Functions
 * Based on: https://github.com/ashima/webgl-noise
 */

// Simplex noise helpers
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

/**
 * 3D Simplex Noise
 */
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  // Permutations
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients
  float n_ = 0.142857142857; // 1.0/7.0
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalize gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

/**
 * Curl Noise - Divergence-free vector field
 * Creates swirling motion without sources or sinks
 */
vec3 curlNoise(vec3 p, float noiseScale, float time) {
  const float e = 0.1;

  vec3 p1 = p + vec3(0.0, e, 0.0);
  vec3 p2 = p - vec3(0.0, e, 0.0);
  vec3 p3 = p + vec3(e, 0.0, 0.0);
  vec3 p4 = p - vec3(e, 0.0, 0.0);
  vec3 p5 = p + vec3(0.0, 0.0, e);
  vec3 p6 = p - vec3(0.0, 0.0, e);

  // Add time evolution
  vec3 timeOffset = vec3(0.0, 0.0, time);

  float n1 = snoise((p1 + timeOffset) * noiseScale);
  float n2 = snoise((p2 + timeOffset) * noiseScale);
  float n3 = snoise((p3 + timeOffset) * noiseScale);
  float n4 = snoise((p4 + timeOffset) * noiseScale);
  float n5 = snoise((p5 + timeOffset) * noiseScale);
  float n6 = snoise((p6 + timeOffset) * noiseScale);

  // Compute curl: ∇ × F
  vec3 curl = vec3(
    (n1 - n2) - (n5 - n6),
    (n5 - n6) - (n3 - n4),
    (n3 - n4) - (n1 - n2)
  ) / (2.0 * e);

  return curl;
}
