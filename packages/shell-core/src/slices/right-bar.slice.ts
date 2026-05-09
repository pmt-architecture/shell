import type { RightBarRequest, RightBarStackItem, RightBarState } from '@-label-/contracts';

import type { SliceFactory } from '../types';

export interface RightBarSliceState {
  rightBar: RightBarState;
  panelRefs: Record<string, number>;
  openPanel: (request: RightBarRequest) => void;
  closePanel: () => void;
  updatePanelPayload: (payload: Record<string, unknown>) => void;
  registerInPanel: (panelId: string) => void;
  unregisterInPanel: (panelId: string) => void;
}

export const rightBarSlice: SliceFactory<RightBarSliceState> = set => ({
  rightBar: { isOpen: false, stack: [] },
  panelRefs: {},
  openPanel: (request: RightBarRequest) =>
    set((state: RightBarSliceState) => ({
      rightBar: {
        isOpen: true,
        stack: [...state.rightBar.stack, { panelId: request.panelId, payload: request.payload ?? {} } satisfies RightBarStackItem],
      },
    })),
  closePanel: () =>
    set((state: RightBarSliceState) => {
      const newStack = state.rightBar.stack.slice(0, -1);
      return {
        rightBar: {
          isOpen: newStack.length > 0,
          stack: newStack,
        },
      };
    }),
  updatePanelPayload: (payload: Record<string, unknown>) =>
    set((state: RightBarSliceState) => {
      const stack = [...state.rightBar.stack];
      const top = stack.at(-1);
      if (!top) return {};
      stack[stack.length - 1] = { panelId: top.panelId, payload: { ...top.payload, ...payload } };
      return { rightBar: { ...state.rightBar, stack } };
    }),
  registerInPanel: (panelId: string) =>
    set((state: RightBarSliceState) => ({
      panelRefs: {
        ...state.panelRefs,
        [panelId]: (state.panelRefs[panelId] ?? 0) + 1,
      },
    })),
  unregisterInPanel: (panelId: string) =>
    set((state: RightBarSliceState) => {
      const current = state.panelRefs[panelId] ?? 0;
      if (current <= 1) {
        // Ref-count reaches 0: remove panel from stack and refs
        const { [panelId]: _, ...remainingReferences } = state.panelRefs;
        const newStack = state.rightBar.stack.filter(item => item.panelId !== panelId);
        return {
          panelRefs: remainingReferences,
          rightBar: {
            isOpen: newStack.length > 0,
            stack: newStack,
          },
        };
      }
      return {
        panelRefs: {
          ...state.panelRefs,
          [panelId]: current - 1,
        },
      };
    }),
});
