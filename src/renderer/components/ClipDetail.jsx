import React, { useEffect, useCallback } from 'react';

function formatTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now - date;

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today - 86400000);
  if (date >= today) return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  if (date >= yesterday) return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;

  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' +
    date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export default function ClipDetail({ item, onCopy, onClose }) {
  const handleCopy = useCallback(() => {
    onCopy(item.id);
  }, [item, onCopy]);

  // Ctrl+C 快捷键复制
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleCopy, onClose]);

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <span className="detail-time">{formatTime(item.timestamp)}</span>
          <button className="detail-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="detail-body">
          {item.type === 'image' ? (
            <img
              className="detail-image"
              src={`file://${item.content}`}
              alt="图片详情"
            />
          ) : (
            <div className="detail-text">{item.content}</div>
          )}
        </div>

        <div className="detail-footer">
          <span className="detail-hint">Ctrl+C 复制</span>
          <button className="detail-copy-btn" onClick={handleCopy}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            复制
          </button>
        </div>
      </div>
    </div>
  );
}
