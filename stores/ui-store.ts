import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      }),
      { name: 'ui-store' }
    )
  )
);
