/**
 * ParticleCurlNoise - Main React Component
 * GPGPU-based particle system with curl noise and mouse interaction
 */

import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { GPGPUManager } from '../gpgpu/GPGPUManager.js';

// Shader sources
import curlNoiseGLSL from '../shaders/curl-noise.glsl?raw';
import particleUpdateFrag from '../shaders/particle-update.frag?raw';
import velocityUpdateFrag from '../shaders/velocity-update.frag?raw';
import particleRenderVert from '../shaders/particle-render.vert?raw';
import particleRenderFrag from '../shaders/particle-render.frag?raw';
import gpgpuPassVert from '../shaders/gpgpu-pass.vert?raw';

const QUALITY_PRESETS = {
  low: { particles: 25000, textureSize: 158 }, // 158^2 = 24964
  medium: { particles: 100000, textureSize: 316 }, // 316^2 = 99856
  high: { particles: 500000, textureSize: 707 }, // 707^2 = 499849
};

export const ParticleCurlNoise = ({
  quality = 'medium',
  mouseMode = 1, // 0: none, 1: attract, 2: repel
  baseColor = [0.1, 0.8, 1.0],
  fastColor = [1.0, 0.2, 0.5],
  noiseScale = 0.5,
  noiseSpeed = 0.1,
  mouseRadius = 2.0,
  mouseStrength = 5.0,
  pointSize = 2.0,
  opacity = 0.6,
  bounds = [10, 10],
  onFPSUpdate = null,
}) => {
  const containerRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const particlesRef = useRef();
  const gpgpuRef = useRef({});
  const mouseRef = useRef(new THREE.Vector3());
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFPSUpdate = useRef(Date.now());

  // Get quality settings
  const qualitySettings = QUALITY_PRESETS[quality] || QUALITY_PRESETS.medium;

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;
    cameraRef.current = camera;

    // Handle resize
    const handleResize = () => {
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Handle mouse move
    const handleMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Project mouse to 3D space
      const vector = new THREE.Vector3(x, y, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      mouseRef.current = camera.position.clone().add(dir.multiplyScalar(distance));
    };
    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Initialize GPGPU and particles
  useEffect(() => {
    if (!rendererRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const textureSize = qualitySettings.textureSize;
    const particleCount = textureSize * textureSize;

    // Clean up previous GPGPU
    if (gpgpuRef.current.position) {
      gpgpuRef.current.position.dispose();
    }
    if (gpgpuRef.current.velocity) {
      gpgpuRef.current.velocity.dispose();
    }
    if (particlesRef.current) {
      scene.remove(particlesRef.current);
      particlesRef.current.geometry.dispose();
      particlesRef.current.material.dispose();
    }

    // Create GPGPU managers
    const gpgpuPosition = new GPGPUManager(renderer, textureSize, textureSize);
    const gpgpuVelocity = new GPGPUManager(renderer, textureSize, textureSize);

    // Initialize position data (random distribution in bounds)
    const positionData = new Float32Array(particleCount * 4);
    for (let i = 0; i < particleCount; i++) {
      const i4 = i * 4;
      positionData[i4 + 0] = (Math.random() - 0.5) * bounds[0] * 2;
      positionData[i4 + 1] = (Math.random() - 0.5) * bounds[1] * 2;
      positionData[i4 + 2] = (Math.random() - 0.5) * bounds[0] * 2;
      positionData[i4 + 3] = 1.0;
    }
    gpgpuPosition.initTexture(positionData);

    // Initialize velocity data (small random velocities)
    const velocityData = new Float32Array(particleCount * 4);
    for (let i = 0; i < particleCount; i++) {
      const i4 = i * 4;
      velocityData[i4 + 0] = (Math.random() - 0.5) * 0.1;
      velocityData[i4 + 1] = (Math.random() - 0.5) * 0.1;
      velocityData[i4 + 2] = (Math.random() - 0.5) * 0.1;
      velocityData[i4 + 3] = 0.0;
    }
    gpgpuVelocity.initTexture(velocityData);

    // Create update materials with curl noise include
    const processShader = (shader) => {
      return shader.replace('#include <curl-noise>', curlNoiseGLSL);
    };

    const velocityUpdateMaterial = new THREE.ShaderMaterial({
      uniforms: {
        texturePosition: { value: null },
        textureVelocity: { value: null },
        time: { value: 0 },
        delta: { value: 0 },
        mousePosition: { value: new THREE.Vector3() },
        mouseRadius: { value: mouseRadius },
        mouseStrength: { value: mouseStrength },
        mouseMode: { value: mouseMode },
        noiseScale: { value: noiseScale },
        noiseSpeed: { value: noiseSpeed },
      },
      vertexShader: gpgpuPassVert,
      fragmentShader: processShader(velocityUpdateFrag),
    });

    const positionUpdateMaterial = new THREE.ShaderMaterial({
      uniforms: {
        texturePosition: { value: null },
        textureVelocity: { value: null },
        time: { value: 0 },
        delta: { value: 0 },
        mousePosition: { value: new THREE.Vector3() },
        mouseRadius: { value: mouseRadius },
        mouseStrength: { value: mouseStrength },
        mouseMode: { value: mouseMode },
        noiseScale: { value: noiseScale },
        noiseSpeed: { value: noiseSpeed },
        bounds: { value: new THREE.Vector2(bounds[0], bounds[1]) },
      },
      vertexShader: gpgpuPassVert,
      fragmentShader: processShader(particleUpdateFrag),
    });

    // Create particle geometry with reference attribute
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const references = new Float32Array(particleCount * 2);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const i2 = i * 2;
      positions[i3 + 0] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      const x = (i % textureSize) / textureSize;
      const y = Math.floor(i / textureSize) / textureSize;
      references[i2 + 0] = x;
      references[i2 + 1] = y;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('reference', new THREE.BufferAttribute(references, 2));

    // Create particle material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        texturePosition: { value: null },
        textureVelocity: { value: null },
        pointSize: { value: pointSize },
        time: { value: 0 },
        baseColor: { value: new THREE.Vector3(...baseColor) },
        fastColor: { value: new THREE.Vector3(...fastColor) },
        opacity: { value: opacity },
      },
      vertexShader: particleRenderVert,
      fragmentShader: particleRenderFrag,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Store references
    particlesRef.current = particles;
    gpgpuRef.current = {
      position: gpgpuPosition,
      velocity: gpgpuVelocity,
      velocityUpdateMaterial,
      positionUpdateMaterial,
    };
  }, [quality, bounds]);

  // Update uniforms when props change
  useEffect(() => {
    if (!particlesRef.current) return;

    particlesRef.current.material.uniforms.pointSize.value = pointSize;
    particlesRef.current.material.uniforms.baseColor.value.set(...baseColor);
    particlesRef.current.material.uniforms.fastColor.value.set(...fastColor);
    particlesRef.current.material.uniforms.opacity.value = opacity;

    if (gpgpuRef.current.velocityUpdateMaterial) {
      gpgpuRef.current.velocityUpdateMaterial.uniforms.mouseRadius.value = mouseRadius;
      gpgpuRef.current.velocityUpdateMaterial.uniforms.mouseStrength.value = mouseStrength;
      gpgpuRef.current.velocityUpdateMaterial.uniforms.mouseMode.value = mouseMode;
      gpgpuRef.current.velocityUpdateMaterial.uniforms.noiseScale.value = noiseScale;
      gpgpuRef.current.velocityUpdateMaterial.uniforms.noiseSpeed.value = noiseSpeed;

      gpgpuRef.current.positionUpdateMaterial.uniforms.mouseRadius.value = mouseRadius;
      gpgpuRef.current.positionUpdateMaterial.uniforms.mouseStrength.value = mouseStrength;
      gpgpuRef.current.positionUpdateMaterial.uniforms.mouseMode.value = mouseMode;
      gpgpuRef.current.positionUpdateMaterial.uniforms.noiseScale.value = noiseScale;
      gpgpuRef.current.positionUpdateMaterial.uniforms.noiseSpeed.value = noiseSpeed;
    }
  }, [mouseMode, baseColor, fastColor, noiseScale, noiseSpeed, mouseRadius, mouseStrength, pointSize, opacity]);

  // Animation loop
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    let animationId;
    let lastTime = performance.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1); // Cap delta at 100ms
      lastTime = now;
      timeRef.current += delta;

      // Update GPGPU
      if (gpgpuRef.current.velocity && gpgpuRef.current.position) {
        const { velocity, position, velocityUpdateMaterial, positionUpdateMaterial } = gpgpuRef.current;

        // Update velocity
        velocityUpdateMaterial.uniforms.texturePosition.value = position.getCurrentTexture();
        velocityUpdateMaterial.uniforms.textureVelocity.value = velocity.getCurrentTexture();
        velocityUpdateMaterial.uniforms.time.value = timeRef.current;
        velocityUpdateMaterial.uniforms.delta.value = delta;
        velocityUpdateMaterial.uniforms.mousePosition.value.copy(mouseRef.current);
        velocity.compute(velocityUpdateMaterial);

        // Update position
        positionUpdateMaterial.uniforms.texturePosition.value = position.getCurrentTexture();
        positionUpdateMaterial.uniforms.textureVelocity.value = velocity.getCurrentTexture();
        positionUpdateMaterial.uniforms.time.value = timeRef.current;
        positionUpdateMaterial.uniforms.delta.value = delta;
        positionUpdateMaterial.uniforms.mousePosition.value.copy(mouseRef.current);
        position.compute(positionUpdateMaterial);

        // Update render material
        if (particlesRef.current) {
          particlesRef.current.material.uniforms.texturePosition.value = position.getCurrentTexture();
          particlesRef.current.material.uniforms.textureVelocity.value = velocity.getCurrentTexture();
          particlesRef.current.material.uniforms.time.value = timeRef.current;
        }
      }

      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);

      // FPS tracking
      frameCountRef.current++;
      if (onFPSUpdate && now - lastFPSUpdate.current > 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastFPSUpdate.current));
        onFPSUpdate(fps);
        frameCountRef.current = 0;
        lastFPSUpdate.current = now;
      }
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [onFPSUpdate]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    />
  );
};
