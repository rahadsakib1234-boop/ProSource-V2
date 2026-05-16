export {};

declare global {
  interface Window {
    electronAPI?: {
      auth: {
        registerAdmin: (email: string, password: string) => Promise<{ success: boolean; organizationId?: string; error?: string }>;
      };
    };
  }
}
