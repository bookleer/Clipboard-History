import { useState, useEffect, useCallback, useMemo } from 'react';

export function useClipboard() {
  const [allItems, setAllItems] = useState([]);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState({ retentionDays: 3 });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const data = await window.api.getHistory();
      setAllItems(data || []);
    } catch (err) {
      setAllItems([]);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await window.api.getSettings();
      setSettings(data || { retentionDays: 3 });
    } catch (err) {
      // 使用默认设置
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchSettings();
    fetchItems();
  }, [fetchSettings, fetchItems]);

  // 监听新剪贴内容推送
  useEffect(() => {
    try {
      window.api.onNewItem(() => fetchItems());
      return () => {
        try { window.api.removeNewItemListener(); } catch (e) { /* ignore */ }
      };
    } catch (e) { /* preload API 尚未就绪 */ }
  }, [fetchItems]);

  // 监听窗口显示时刷新
  useEffect(() => {
    try {
      window.api.onWindowShown(() => fetchItems());
      return () => {
        try { window.api.removeWindowShownListener(); } catch (e) { /* ignore */ }
      };
    } catch (e) { /* preload API 尚未就绪 */ }
  }, [fetchItems]);

  // 本地搜索过滤（300ms 防抖）
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const items = useMemo(() => {
    if (!debouncedSearch.trim()) return allItems;
    const keyword = debouncedSearch.trim().toLowerCase();
    return allItems.filter(
      (item) => item.type === 'text' && item.content.toLowerCase().includes(keyword)
    );
  }, [allItems, debouncedSearch]);

  const togglePin = useCallback(async (id) => {
    try {
      await window.api.pinItem(id);
      setAllItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, pinned: item.pinned ? 0 : 1 } : item
        )
      );
    } catch (err) {
      showToast('操作失败', 'error');
    }
  }, [showToast]);

  const deleteItem = useCallback(async (id) => {
    try {
      await window.api.deleteItem(id);
      setAllItems((prev) => prev.filter((item) => item.id !== id));
      showToast('已删除', 'success');
    } catch (err) {
      showToast('删除失败', 'error');
    }
  }, [showToast]);

  const copyItem = useCallback(async (id) => {
    try {
      await window.api.copyItem(id);
      showToast('已复制到剪贴板', 'success');
      await window.api.hideWindow();
    } catch (err) {
      showToast('复制失败', 'error');
    }
  }, [showToast]);

  const updateSettings = useCallback(async (key, value) => {
    try {
      await window.api.updateSettings(key, value);
      setSettings((prev) => ({ ...prev, [key]: value }));
      showToast('设置已更新', 'success');
    } catch (err) {
      showToast('设置更新失败', 'error');
    }
  }, [showToast]);

  return {
    items,
    search,
    setSearch,
    settings,
    toast,
    togglePin,
    deleteItem,
    copyItem,
    updateSettings,
  };
}
