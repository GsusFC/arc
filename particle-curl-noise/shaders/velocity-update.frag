/**
 * Velocity Update Fragment Shader
 * Stores velocity separately for better numerical stability
 */

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform float time;
uniform float delta;
uniform vec3 mousePosition;
uniform float mouseRadius;
uniform float mouseStrength;
uniform int mouseMode;
uniform float noiseScale;
uniform float noiseSpeed;

varying vec2 vUv;

// Include curl noise functions
#include <curl-noise>

void main() {
  vec4 posData = texture2D(texturePosition, vUv);
  vec3 pos = posData.xyz;
  vec4 velData = texture2D(textureVelocity, vUv);
  vec3 vel = velData.xyz;

  // Apply curl noise force
  vec3 curl = curlNoise(pos, noiseScale, time * noiseSpeed);
  vel += curl * delta * 0.5;

  // Mouse interaction
  if (mouseMode > 0) {
    vec3 toMouse = mousePosition - pos;
    float dist = length(toMouse);

    if (dist < mouseRadius && dist > 0.01) {
      vec3 direction = normalize(toMouse);
      float influence = 1.0 - (dist / mouseRadius);
      influence = pow(influence, 2.0);

      if (mouseMode == 1) {
        vel += direction * influence * mouseStrength * delta;
      } else if (mouseMode == 2) {
        vel -= direction * influence * mouseStrength * delta;
      }
    }
  }

  // Damping
  vel *= 0.98;

  // Velocity limiting
  float maxSpeed = 2.0;
  float speed = length(vel);
  if (speed > maxSpeed) {
    vel = normalize(vel) * maxSpeed;
  }

  gl_FragColor = vec4(vel, 1.0);
}
