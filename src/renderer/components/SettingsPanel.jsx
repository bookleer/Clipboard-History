import React from 'react';

const DAY_OPTIONS = [
  { value: 1, label: '1 天' },
  { value: 3, label: '3 天' },
  { value: 5, label: '5 天' },
];

export default function SettingsPanel({ retentionDays, onChange, onClose }) {
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>设置</h3>
          <button className="settings-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="settings-section">
          <label className="settings-label">保留天数</label>
          <p className="settings-desc">超过设定天数的记录将自动清理</p>
          <div className="segmented-control">
            {DAY_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`segment-btn ${retentionDays === option.value ? 'active' : ''}`}
                onClick={() => onChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-footer">
          <span className="settings-version">版本 1.0.0</span>
        </div>
      </div>
    </div>
  );
}
