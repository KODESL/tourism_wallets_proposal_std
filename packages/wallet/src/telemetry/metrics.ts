/**
 * No-op timing wrapper. Replaces the React Native / MMKV Metrics collector
 * from the EUDI prototype so protocol clients stay portable.
 */

export const metrics = {
  async time<T>(
    _name: string,
    fn: () => Promise<T>,
    _meta?: Record<string, unknown>
  ): Promise<T> {
    return fn();
  },
};
