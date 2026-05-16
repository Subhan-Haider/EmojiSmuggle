import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('smuggle_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse history from localStorage', e);
      return [];
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('smuggle_settings');
      return saved ? JSON.parse(saved) : {
        theme: 'cyberpunk',
        sounds: true,
        encryptionLevel: 'standard',
        emojiPack: 'cyberpunk',
        terminalMode: false
      };
    } catch (e) {
      return {
        theme: 'cyberpunk',
        sounds: true,
        encryptionLevel: 'standard',
        emojiPack: 'cyberpunk',
        terminalMode: false
      };
    }
  });

  const [user, setUser] = useState({ name: 'GUEST_07', role: 'OPERATOR' });

  useEffect(() => {
    localStorage.setItem('smuggle_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('smuggle_settings', JSON.stringify(settings));
    
    const applyTheme = (theme) => {
      let activeTheme = theme;
      if (theme === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'cyberpunk' : 'light';
      }

      document.documentElement.setAttribute('data-theme', activeTheme);
      if (activeTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    };

    applyTheme(settings.theme);

    // If system theme is selected, listen for changes
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings]);

  const addToHistory = (entry) => {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...entry
    };
    setHistory(prev => [newEntry, ...prev].slice(0, 50));
  };

  const deleteHistoryItem = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <AppContext.Provider value={{ 
      history, 
      settings, 
      setSettings, 
      user, 
      addToHistory, 
      deleteHistoryItem,
      clearHistory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
