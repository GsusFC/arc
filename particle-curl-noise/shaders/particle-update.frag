/**
 * Particle Update Fragment Shader
 * Updates particle positions using curl noise and mouse interaction
 */

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform float time;
uniform float delta;
uniform vec3 mousePosition;
uniform float mouseRadius;
uniform float mouseStrength;
uniform int mouseMode; // 0: none, 1: attract, 2: repel
uniform float noiseScale;
uniform float noiseSpeed;
uniform vec2 bounds;

varying vec2 vUv;

// Include curl noise functions
#include <curl-noise>

void main() {
  vec4 posData = texture2D(texturePosition, vUv);
  vec3 pos = posData.xyz;
  vec4 velData = texture2D(textureVelocity, vUv);
  vec3 vel = velData.xyz;

  // Apply curl noise
  vec3 curl = curlNoise(pos, noiseScale, time * noiseSpeed);
  vel += curl * delta * 0.5;

  // Mouse interaction
  if (mouseMode > 0) {
    vec3 toMouse = mousePosition - pos;
    float dist = length(toMouse);

    if (dist < mouseRadius && dist > 0.01) {
      vec3 direction = normalize(toMouse);
      float influence = 1.0 - (dist / mouseRadius);
      influence = pow(influence, 2.0); // Squared falloff

      if (mouseMode == 1) {
        // Attract
        vel += direction * influence * mouseStrength * delta;
      } else if (mouseMode == 2) {
        // Repel
        vel -= direction * influence * mouseStrength * delta;
      }
    }
  }

  // Apply velocity damping
  vel *= 0.98;

  // Update position
  pos += vel * delta;

  // Boundary wrapping
  if (abs(pos.x) > bounds.x) pos.x = -sign(pos.x) * bounds.x;
  if (abs(pos.y) > bounds.y) pos.y = -sign(pos.y) * bounds.y;
  if (abs(pos.z) > bounds.x) pos.z = -sign(pos.z) * bounds.x;

  gl_FragColor = vec4(pos, 1.0);
}
