import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  const icon = type === 'success' ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ) : type === 'error' ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ) : null;

  return (
    <div className={`toast ${visible ? 'show' : ''} ${type}`}>
      {icon}
      <span>{message}</span>
    </div>
  );
}
