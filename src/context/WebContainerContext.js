// src/context/WebContainerContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { WebContainer } from '@webcontainer/api';

const WebContainerContext = createContext({
  webContainer: null,
  isReady: false,
  error: null
});

export const WebContainerProvider = ({ children }) => {
  const [webContainer, setWebContainer] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let bootPromise = null;

    const initWebContainer = async () => {
      try {
        console.log('🚀 Booting WebContainer...');
        bootPromise = WebContainer.boot();
        const instance = await bootPromise;
        
        if (!isMounted) return;
        
        console.log('✅ WebContainer booted successfully');
        setWebContainer(instance);
        setIsReady(true);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        
        console.error('❌ WebContainer boot failed:', err);
        setError(err.message || 'Failed to initialize WebContainer');
        // Still mark as ready for fallback mode
        setIsReady(true);
      }
    };

    initWebContainer();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = {
    webContainer,
    isReady,
    error
  };

  return (
    <WebContainerContext.Provider value={value}>
      {children}
    </WebContainerContext.Provider>
  );
};

export const useWebContainer = () => {
  const context = useContext(WebContainerContext);
  if (!context) {
    throw new Error('useWebContainer must be used within WebContainerProvider');
  }
  return context;
};
