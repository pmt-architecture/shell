/**
 * Sample type for shell-hooks tests.
 *
 * The shell framework (contracts/shell-core/shell-hooks) is **domain-agnostic**.
 * Tests need a generic reference type to exercise event payloads and slice
 * state generics — without coupling to any concrete domain package.
 */
export interface SampleEntityRef {
  id: string;
  label: string;
  status: 'active' | 'archived' | 'pending';
}
