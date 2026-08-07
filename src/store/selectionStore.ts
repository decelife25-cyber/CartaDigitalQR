import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SelectionState {
  selectedIds: string[];
  addSelection: (id: string) => void;
  removeSelection: (id: string) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set, get) => ({
      selectedIds: [],
      addSelection: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds
            : [...state.selectedIds, id]
        })),
      removeSelection: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.filter((item) => item !== id)
        })),
      clearSelection: () => set({ selectedIds: [] }),
      isSelected: (id) => get().selectedIds.includes(id),
    }),
    {
      name: 'carta-digital-selection',
    }
  )
);