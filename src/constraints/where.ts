import type {
  FieldPath,
  WhereFilterOp,
} from '@lemasc/firebase-wrapper/firestore'
import { where as _where } from '@lemasc/firebase-wrapper/firestore'
import { TypedQueryConstraint } from '../types/Collection'

/**
 * Creates a {QueryConstraint} that enforces that documents must contain the
 * specified field and that the value should satisfy the relation constraint
 * provided.
 *
 * @param fieldPath - The path to compare
 * @param opStr - The operation string (e.g "&lt;", "&lt;=", "==", "&lt;",
 *   "&lt;=", "!=").
 * @param value - The value for comparison
 * @returns The created {Query}.
 */
export function where<Doc extends Record<string, any>>(
  fieldPath: keyof Doc | FieldPath,
  opStr: WhereFilterOp,
  value: unknown
): TypedQueryConstraint<Doc> {
  return _where(fieldPath as string, opStr, value)
}
