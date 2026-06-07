/**
 * Optimistic reaction helpers used by the blog reaction mutation.
 *
 * The reaction mutation applies an optimistic increment immediately on click
 * (Req 4.5) and, if the submission fails, restores the previously displayed
 * count (Req 4.6). These pure helpers encapsulate that arithmetic so the
 * mutation's `onMutate`/`onError` handlers stay trivial and the behavior is
 * property-testable without a DOM or network.
 */

/**
 * Apply the optimistic update to the current reaction count by incrementing it
 * by one. Used in the mutation's `onMutate` before the request resolves.
 */
export const applyOptimistic = (count: number): number => count + 1;

/**
 * Roll the reaction count back to its previously displayed value. Used in the
 * mutation's `onError` to discard the optimistic increment after a failure.
 */
export const rollback = (_count: number, previous: number): number => previous;
