/**
 * Particle Render Fragment Shader
 * Colors particles based on velocity
 */

uniform vec3 baseColor;
uniform vec3 fastColor;
uniform float opacity;

varying vec3 vVelocity;
varying float vSpeed;

void main() {
  // Create circular particles
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) {
    discard;
  }

  // Soft edges
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  // Color based on speed
  float speedNorm = clamp(vSpeed / 2.0, 0.0, 1.0);
  vec3 color = mix(baseColor, fastColor, speedNorm);

  // Add slight glow
  alpha *= opacity;

  gl_FragColor = vec4(color, alpha);
}
