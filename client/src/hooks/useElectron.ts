/**
 * useElectron Hook
 * Access Electron API from React components
 */

export function useElectron() {
  const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

  return {
    isElectron,
    api: isElectron ? (window as any).electronAPI : null,
  };
}
