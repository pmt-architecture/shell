// ── Slice Descriptor ─────────────────────────────────────────

export interface SliceDescriptor<T = Record<string, unknown>> {
  name: string;
  initialState: T;
}

// ── Event Descriptor ─────────────────────────────────────────

/**
 * Describes a fire-and-forget event scoped to a slice. Always define an
 * EventDescriptor with an explicit type annotation (not `as const satisfies`) —
 * see ADR-015 for the rationale.
 */
export interface EventDescriptor<TPayload = unknown> {
  readonly sliceName: string;
  readonly eventName: string;
  /** Phantom marker for compile-time payload inference. Never set at runtime. */
  readonly __payload?: TPayload;
}

// ── Right-bar ────────────────────────────────────────────────

export interface RightBarRequest {
  panelId: string;
  payload?: Record<string, unknown>;
}

export interface RightBarStackItem {
  panelId: string;
  payload: Record<string, unknown>;
}

export interface RightBarState {
  isOpen: boolean;
  /** Panel stack. Last item is the visible panel. */
  stack: RightBarStackItem[];
}

// ── ShellApi (exposed to remotes via props) ──────────────────

export interface ShellApi {
  // Right-bar
  openPanel(request: RightBarRequest): void;
  closePanel(): void;
  updatePanelPayload(payload: Record<string, unknown>): void;

  // Navigation
  navigate(path: string): void;

  // Panel lifecycle (ref-counting)
  registerInPanel(panelId: string): void;
  unregisterInPanel(panelId: string): void;

  // Dynamic slice registry — state
  registerSlice<T>(descriptor: SliceDescriptor<T>): void;
  unregisterSlice(name: string): void;
  getSliceState<T>(name: string): T | undefined;
  setSliceState<T>(name: string, partial: Partial<T>): void;
  onSliceChange<T>(name: string, listener: (state: T) => void): () => void;

  // Dynamic slice registry — events (fire-and-forget)
  emitSliceEvent<TPayload>(descriptor: EventDescriptor<TPayload>, payload: TPayload): void;
  onSliceEvent<TPayload>(descriptor: EventDescriptor<TPayload>, listener: (payload: TPayload) => void): () => void;
}
