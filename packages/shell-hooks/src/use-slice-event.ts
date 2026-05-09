import { useEffect, useRef } from 'react';

import type { EventDescriptor } from '@-label-/contracts';
import type { DynamicSlicesState, EventEnvelope } from '@-label-/shell-core';

import { getShellStoreInstance } from './use-shell-store';

/**
 * Subscribe to a slice event from a React component. The hook is listener-only
 * — it does NOT cause the component to re-render when the event fires. Event
 * semantics are fire-and-forget by design; to expose the payload as UI state,
 * compose with `useState`:
 *
 *     const [vehicle, setVehicle] = useState(null);
 *     useSliceEvent(FLEET_VEHICLE_SELECTED_EVENT, setVehicle);
 */
export const useSliceEvent = <TPayload>(descriptor: EventDescriptor<TPayload>, listener: (payload: TPayload) => void): void => {
  // Stable listener reference so the effect doesn't re-subscribe on every render
  const listenerRef = useRef(listener);
  useEffect(() => {
    listenerRef.current = listener;
  });

  useEffect(() => {
    const store = getShellStoreInstance();
    return store.subscribe(
      (state: DynamicSlicesState) => state.dynamicEvents[descriptor.sliceName]?.[descriptor.eventName],
      wrapped => {
        if (wrapped !== undefined) listenerRef.current((wrapped as EventEnvelope<TPayload>).value);
      },
    );
  }, [descriptor.sliceName, descriptor.eventName]);
};
