import React from 'react';
import ClipCard from './ClipCard';

export default function ClipList({ items, onPin, onDelete, onOpen }) {
  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
          <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" />
        </svg>
        <p className="empty-title">暂无剪贴记录</p>
        <p className="empty-subtitle">试试复制一些内容吧</p>
      </div>
    );
  }

  const pinnedItems = items.filter((item) => item.pinned);
  const normalItems = items.filter((item) => !item.pinned);

  return (
    <div className="clip-list">
      {pinnedItems.length > 0 && (
        <>
          {pinnedItems.map((item) => (
            <ClipCard
              key={item.id}
              item={item}
              onPin={onPin}
              onDelete={onDelete}
              onOpen={onOpen}
            />
          ))}
          {normalItems.length > 0 && <div className="list-divider" />}
        </>
      )}
      {normalItems.map((item) => (
        <ClipCard
          key={item.id}
          item={item}
          onPin={onPin}
          onDelete={onDelete}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
