// src/context/WebContainerContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { WebContainer } from '@webcontainer/api';

const WebContainerContext = createContext({
  webContainer: null,
  isReady: false
});

export const WebContainerProvider = ({ children }) => {
  const [webContainer, setWebContainer] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initWebContainer = async () => {
      try {
        console.log('🚀 Booting WebContainer...');
        const container = await WebContainer.boot();
        setWebContainer(container);
        setIsReady(true);
        console.log('✅ WebContainer ready!');
      } catch (error) {
        console.error('❌ WebContainer boot failed:', error);
      }
    };

    initWebContainer();
  }, []);

  return (
    <WebContainerContext.Provider value={{ webContainer, isReady }}>
      {children}
    </WebContainerContext.Provider>
  );
};

export const useWebContainer = () => useContext(WebContainerContext);
