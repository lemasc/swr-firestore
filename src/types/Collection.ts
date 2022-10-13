import { QueryConstraint as Constraint } from '@firebase/firestore'

/**
 * This is a mock `QueryConstraint` interface that also accepts a `Doc` type argument.
 * This makes custom `where` and `orderBy` functions have intellisense working.
 */
export interface TypedQueryConstraint<Doc extends Record<string, any>>
  extends Constraint {
  __doc?: Doc
}

export type QueryConstraint<Doc extends Record<string, any>> =
  | Constraint
  | TypedQueryConstraint<Doc>

export type CollectionQueryType<Doc extends Record<string, any>> = {
  constraints?: QueryConstraint<Doc>[]
  isCollectionGroup?: boolean
}
