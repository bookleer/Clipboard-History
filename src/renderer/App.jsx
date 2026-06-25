import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import ClipList from './components/ClipList';
import ClipDetail from './components/ClipDetail';
import SettingsPanel from './components/SettingsPanel';
import Toast from './components/Toast';
import { useClipboard } from './hooks/useClipboard';

export default function App() {
  const {
    items,
    search,
    setSearch,
    settings,
    toast,
    togglePin,
    deleteItem,
    copyItem,
    updateSettings,
  } = useClipboard();

  const [showSettings, setShowSettings] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  // 窗口每次打开时重置到列表视图
  useEffect(() => {
    try {
      window.api.onWindowShown(() => setDetailItem(null));
      return () => {
        try { window.api.removeWindowShownListener(); } catch (e) { /* ignore */ }
      };
    } catch (e) { /* ignore */ }
  }, []);

  const handleOpenDetail = (item) => {
    setDetailItem(item);
  };

  const handleCopyFromDetail = async (id) => {
    await copyItem(id);
    setDetailItem(null);
  };

  const handleCloseDetail = () => {
    setDetailItem(null);
  };

  return (
    <div className="app">
      {detailItem ? (
        <ClipDetail
          item={detailItem}
          onCopy={handleCopyFromDetail}
          onClose={handleCloseDetail}
        />
      ) : (
        <>
          <div className="header">
            <SearchBar value={search} onChange={setSearch} />
            <button
              className="settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              title="设置"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
          </div>

          <ClipList
            items={items}
            onPin={togglePin}
            onDelete={deleteItem}
            onOpen={handleOpenDetail}
          />

          {showSettings && (
            <SettingsPanel
              retentionDays={settings.retentionDays}
              onChange={(days) => updateSettings('retentionDays', days)}
              onClose={() => setShowSettings(false)}
            />
          )}
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
