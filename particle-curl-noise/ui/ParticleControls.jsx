/**
 * ParticleControls - UI component for controlling particle system
 */

import React from 'react';

export const ParticleControls = ({
  quality,
  onQualityChange,
  mouseMode,
  onMouseModeChange,
  noiseScale,
  onNoiseScaleChange,
  noiseSpeed,
  onNoiseSpeedChange,
  mouseRadius,
  onMouseRadiusChange,
  mouseStrength,
  onMouseStrengthChange,
  pointSize,
  onPointSizeChange,
  opacity,
  onOpacityChange,
  fps,
  onReset,
}) => {
  return (
    <div className="controls-panel">
      <div className="controls-section">
        <h3>Performance</h3>
        <div className="control-group">
          <label>Quality</label>
          <select value={quality} onChange={(e) => onQualityChange(e.target.value)}>
            <option value="low">Low (25k particles)</option>
            <option value="medium">Medium (100k particles)</option>
            <option value="high">High (500k particles)</option>
          </select>
        </div>
        {fps !== null && (
          <div className="control-group">
            <label>FPS</label>
            <div className="fps-display">{fps}</div>
          </div>
        )}
      </div>

      <div className="controls-section">
        <h3>Mouse Interaction</h3>
        <div className="control-group">
          <label>Mode</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="mouseMode"
                value="0"
                checked={mouseMode === 0}
                onChange={() => onMouseModeChange(0)}
              />
              None
            </label>
            <label>
              <input
                type="radio"
                name="mouseMode"
                value="1"
                checked={mouseMode === 1}
                onChange={() => onMouseModeChange(1)}
              />
              Attract
            </label>
            <label>
              <input
                type="radio"
                name="mouseMode"
                value="2"
                checked={mouseMode === 2}
                onChange={() => onMouseModeChange(2)}
              />
              Repel
            </label>
          </div>
        </div>
        <div className="control-group">
          <label>Radius: {mouseRadius.toFixed(1)}</label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={mouseRadius}
            onChange={(e) => onMouseRadiusChange(parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label>Strength: {mouseStrength.toFixed(1)}</label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={mouseStrength}
            onChange={(e) => onMouseStrengthChange(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="controls-section">
        <h3>Curl Noise</h3>
        <div className="control-group">
          <label>Scale: {noiseScale.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.05"
            value={noiseScale}
            onChange={(e) => onNoiseScaleChange(parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label>Speed: {noiseSpeed.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={noiseSpeed}
            onChange={(e) => onNoiseSpeedChange(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="controls-section">
        <h3>Appearance</h3>
        <div className="control-group">
          <label>Point Size: {pointSize.toFixed(1)}</label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={pointSize}
            onChange={(e) => onPointSizeChange(parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label>Opacity: {opacity.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="controls-section">
        <button onClick={onReset} className="reset-button">
          Reset to Defaults
        </button>
      </div>

      <style jsx>{`
        .controls-panel {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 300px;
          background: rgba(0, 0, 0, 0.85);
          border: 1px solid rgba(0, 255, 0, 0.3);
          border-radius: 8px;
          padding: 20px;
          font-family: 'Courier New', monospace;
          color: #0f0;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          z-index: 1000;
        }

        .controls-section {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(0, 255, 0, 0.2);
        }

        .controls-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        h3 {
          margin: 0 0 15px 0;
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .control-group {
          margin-bottom: 15px;
        }

        .control-group:last-child {
          margin-bottom: 0;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-size: 12px;
        }

        select,
        input[type='range'] {
          width: 100%;
        }

        select {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(0, 255, 0, 0.5);
          color: #0f0;
          padding: 8px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
        }

        select:focus {
          outline: none;
          border-color: #0f0;
        }

        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: rgba(0, 255, 0, 0.2);
          border-radius: 2px;
          outline: none;
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #0f0;
          border-radius: 50%;
          cursor: pointer;
        }

        input[type='range']::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #0f0;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }

        .radio-group {
          display: flex;
          gap: 10px;
        }

        .radio-group label {
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          margin-bottom: 0;
        }

        input[type='radio'] {
          accent-color: #0f0;
        }

        .fps-display {
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid rgba(0, 255, 0, 0.3);
          padding: 8px;
          border-radius: 4px;
          text-align: center;
          font-weight: bold;
        }

        .reset-button {
          width: 100%;
          padding: 10px;
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid rgba(0, 255, 0, 0.5);
          color: #0f0;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.2s;
        }

        .reset-button:hover {
          background: rgba(0, 255, 0, 0.2);
          border-color: #0f0;
        }

        .reset-button:active {
          transform: scale(0.98);
        }

        /* Scrollbar styling */
        .controls-panel::-webkit-scrollbar {
          width: 8px;
        }

        .controls-panel::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }

        .controls-panel::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 0, 0.5);
          border-radius: 4px;
        }

        .controls-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 0, 0.7);
        }
      `}</style>
    </div>
  );
};
