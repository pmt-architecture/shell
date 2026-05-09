import type { SliceFactory } from '../types';

export interface NavigationSliceState {
  navigateCallback: ((path: string) => void) | null;
  setNavigate: (navigateFunction: (path: string) => void) => void;
}

export const navigationSlice: SliceFactory<NavigationSliceState> = set => ({
  navigateCallback: null,
  setNavigate: (navigateFunction: (path: string) => void) => set(() => ({ navigateCallback: navigateFunction })),
});
