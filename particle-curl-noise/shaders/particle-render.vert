/**
 * Particle Render Vertex Shader
 * Positions particles and sets point size based on velocity
 */

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform float pointSize;
uniform float time;

attribute vec2 reference; // UV coordinate into position texture

varying vec3 vVelocity;
varying float vSpeed;

void main() {
  // Fetch position from texture
  vec4 posData = texture2D(texturePosition, reference);
  vec3 pos = posData.xyz;

  // Fetch velocity for coloring
  vec4 velData = texture2D(textureVelocity, reference);
  vec3 vel = velData.xyz;

  vVelocity = vel;
  vSpeed = length(vel);

  // Set point size based on speed (optional visual enhancement)
  float sizeMultiplier = 1.0 + vSpeed * 0.3;
  gl_PointSize = pointSize * sizeMultiplier;

  // Transform position
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Perspective-correct point size
  gl_PointSize *= (300.0 / -mvPosition.z);
}
