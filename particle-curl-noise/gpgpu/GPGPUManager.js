/**
 * GPGPUManager - Handles ping-pong Frame Buffer Objects for GPU computation
 * Allows reading and writing to textures in a double-buffered manner
 */

import * as THREE from 'three';

export class GPGPUManager {
  constructor(renderer, width, height) {
    this.renderer = renderer;
    this.width = width;
    this.height = height;

    // Create two render targets for ping-pong
    const options = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };

    this.targetA = new THREE.WebGLRenderTarget(width, height, options);
    this.targetB = new THREE.WebGLRenderTarget(width, height, options);

    // Track which is current
    this.currentTarget = this.targetA;
    this.nextTarget = this.targetB;

    // Create a scene and camera for FBO rendering
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Create a plane mesh that fills the viewport
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry);
    this.scene.add(this.mesh);
  }

  /**
   * Initialize texture with data
   */
  initTexture(data) {
    const texture = new THREE.DataTexture(
      data,
      this.width,
      this.height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    texture.needsUpdate = true;

    // Render to both targets to initialize them
    const material = new THREE.MeshBasicMaterial({ map: texture });
    this.mesh.material = material;

    this.renderer.setRenderTarget(this.targetA);
    this.renderer.render(this.scene, this.camera);

    this.renderer.setRenderTarget(this.targetB);
    this.renderer.render(this.scene, this.camera);

    this.renderer.setRenderTarget(null);

    material.dispose();
    texture.dispose();
  }

  /**
   * Compute step: render with custom material to update state
   */
  compute(material) {
    this.mesh.material = material;

    // Render to next target
    this.renderer.setRenderTarget(this.nextTarget);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);

    // Swap targets
    this.swap();
  }

  /**
   * Swap ping-pong targets
   */
  swap() {
    const temp = this.currentTarget;
    this.currentTarget = this.nextTarget;
    this.nextTarget = temp;
  }

  /**
   * Get current state texture
   */
  getCurrentTexture() {
    return this.currentTarget.texture;
  }

  /**
   * Clean up
   */
  dispose() {
    this.targetA.dispose();
    this.targetB.dispose();
    this.mesh.geometry.dispose();
    if (this.mesh.material) {
      this.mesh.material.dispose();
    }
  }
}
