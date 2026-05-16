export async function initDB(): Promise<void> {
  if (typeof window === 'undefined') return;
  const key = 'prosource:db-initialized';
  if (!window.localStorage.getItem(key)) {
    window.localStorage.setItem(key, new Date().toISOString());
  }
}
