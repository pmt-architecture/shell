/**
 * Sample type for shell-core tests.
 *
 * The shell framework (contracts/shell-core/shell-hooks) is **domain-agnostic**.
 * Tests need a generic reference type to exercise event payloads and slice
 * state generics — without coupling to any concrete domain package.
 *
 * Previously these tests imported `VehicleRef` from `@-label-/fleet-contracts`
 * which created an unwanted dependency: shell tests breaking when the fleet
 * domain shape changes.
 */
export interface SampleEntityRef {
  id: string;
  label: string;
  status: 'active' | 'archived' | 'pending';
}
