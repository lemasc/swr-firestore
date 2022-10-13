import type { FieldPath, OrderByDirection } from '@firebase/firestore'
import { orderBy as _orderBy } from '@firebase/firestore'
import { TypedQueryConstraint } from '../types/Collection'

/**
 * Creates a {@link QueryConstraint} that sorts the query result by the
 * specified field, optionally in descending order instead of ascending.
 *
 * @param fieldPath - The field to sort by.
 * @param directionStr - Optional direction to sort by ('asc' or 'desc'). If
 * not specified, order will be ascending.
 * @returns The created {@link Query}.
 */
export function orderBy<Doc extends Record<string, any>>(
  fieldPath: keyof Doc | FieldPath,
  directionStr?: OrderByDirection
): TypedQueryConstraint<Doc> {
  return _orderBy(fieldPath as string, directionStr)
}
