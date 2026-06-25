import React from 'react';

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

export default function ClipCard({ item, onPin, onDelete, onOpen }) {
  const handleClick = () => {
    onOpen(item);
  };

  return (
    <div
      className={`clip-card ${item.pinned ? 'pinned' : ''}`}
      onClick={handleClick}
    >
      <div className="clip-card-content">
        {item.type === 'image' ? (
          <div className="clip-image-preview">
            <img src={`file://${item.content}`} alt="剪贴板图片" />
          </div>
        ) : (
          <div className="clip-text-preview">
            {item.content}
          </div>
        )}
      </div>

      <div className="clip-card-footer">
        <span className="clip-time">{formatTime(item.timestamp)}</span>
        <div className="clip-actions">
          <button
            className={`clip-action-btn ${item.pinned ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onPin(item.id); }}
            title={item.pinned ? '取消置顶' : '置顶'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={item.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3 6h3l-2 6h-2v7h-4v-7H8l-2-6h3l3-6z" />
            </svg>
          </button>
          <button
            className="clip-action-btn danger"
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            title="删除"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
