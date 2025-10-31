/**
 * App - Main application component
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ParticleCurlNoise } from './components/ParticleCurlNoise.jsx';
import { ParticleControls } from './ui/ParticleControls.jsx';

const DEFAULT_SETTINGS = {
  quality: 'medium',
  mouseMode: 1,
  noiseScale: 0.5,
  noiseSpeed: 0.1,
  mouseRadius: 2.0,
  mouseStrength: 5.0,
  pointSize: 2.0,
  opacity: 0.6,
  baseColor: [0.1, 0.8, 1.0],
  fastColor: [1.0, 0.2, 0.5],
  bounds: [10, 10],
};

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [fps, setFPS] = useState(null);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <ParticleCurlNoise
        quality={settings.quality}
        mouseMode={settings.mouseMode}
        baseColor={settings.baseColor}
        fastColor={settings.fastColor}
        noiseScale={settings.noiseScale}
        noiseSpeed={settings.noiseSpeed}
        mouseRadius={settings.mouseRadius}
        mouseStrength={settings.mouseStrength}
        pointSize={settings.pointSize}
        opacity={settings.opacity}
        bounds={settings.bounds}
        onFPSUpdate={setFPS}
      />
      <ParticleControls
        quality={settings.quality}
        onQualityChange={(v) => updateSetting('quality', v)}
        mouseMode={settings.mouseMode}
        onMouseModeChange={(v) => updateSetting('mouseMode', v)}
        noiseScale={settings.noiseScale}
        onNoiseScaleChange={(v) => updateSetting('noiseScale', v)}
        noiseSpeed={settings.noiseSpeed}
        onNoiseSpeedChange={(v) => updateSetting('noiseSpeed', v)}
        mouseRadius={settings.mouseRadius}
        onMouseRadiusChange={(v) => updateSetting('mouseRadius', v)}
        mouseStrength={settings.mouseStrength}
        onMouseStrengthChange={(v) => updateSetting('mouseStrength', v)}
        pointSize={settings.pointSize}
        onPointSizeChange={(v) => updateSetting('pointSize', v)}
        opacity={settings.opacity}
        onOpacityChange={(v) => updateSetting('opacity', v)}
        fps={fps}
        onReset={handleReset}
      />

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.85)',
        border: '1px solid rgba(0, 255, 0, 0.3)',
        borderRadius: '8px',
        padding: '15px',
        maxWidth: '400px',
        fontFamily: "'Courier New', monospace",
        color: '#0f0',
        fontSize: '12px',
        zIndex: 1000,
      }}>
        <h2 style={{
          fontSize: '16px',
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          Particle Curl Noise
        </h2>
        <p style={{ marginBottom: '8px', lineHeight: '1.6', color: 'rgba(0, 255, 0, 0.8)' }}>
          GPGPU-accelerated particle system with curl noise flow field and mouse interaction.
        </p>
        <ul style={{ listStyle: 'none', marginTop: '10px', color: 'rgba(0, 255, 0, 0.7)' }}>
          <li style={{ padding: '3px 0' }}>▸ Divergence-free 3D curl noise</li>
          <li style={{ padding: '3px 0' }}>▸ Ping-pong FBO advection</li>
          <li style={{ padding: '3px 0' }}>▸ Attract/repel mouse modes</li>
          <li style={{ padding: '3px 0' }}>▸ Up to 500k particles @ 60 FPS</li>
        </ul>
      </div>
    </div>
  );
}
