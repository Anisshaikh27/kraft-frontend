import { useMemo, useState } from 'react';
import { filesToSandpackFormat } from '../utils/sandpackParser';

/**
 * Hook to convert files array to Sandpack format
 * @param {Array} files - Array of file objects with path and content
 * @returns {Object} - Sandpack compatible files object
 */
export const useSandpackFiles = (files) => {
  return useMemo(() => {
    return filesToSandpackFormat(files);
  }, [files]);
};

/**
 * Hook to get Sandpack configuration with sensible defaults
 * @returns {Object} - Sandpack options configuration
 */
export const useSandpackOptions = () => {
  return useMemo(
    () => ({
      showLineNumbers: true,
      showInlineErrors: true,
      showTabs: true,
      recompileMode: 'delayed',
      recompileDelay: 300,
      autoReload: true,
      closableTabs: false,
      editorHeight: 'auto',
      editorWidthPercentage: 50,
    }),
    []
  );
};

/**
 * Hook to manage Sandpack editor view mode
 * @param {String} initialMode - 'editor' | 'split' | 'explorer'
 * @returns {Object} - { mode, setMode }
 */
export const useSandpackViewMode = (initialMode = 'editor') => {
  const [mode, setMode] = useState(initialMode);

  return { mode, setMode };
};
