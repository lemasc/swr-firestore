import { collection, collectionGroup, query, Query } from '@firebase/firestore'
import type { CollectionQueryType } from '../../types'
import { db } from '../../helpers'

export const createQuery = <Doc extends object = {}>(
  path: string,
  { constraints = [], isCollectionGroup }: CollectionQueryType<Doc>
) => {
  const ref = (isCollectionGroup ? collectionGroup : collection).apply(null, [
    db(),
    path,
  ])
  return query(ref, ...constraints)
}

export const createStableQueryKey = (
  query: Query | null
): Record<string, unknown> => {
  if (!query) return {}
  return JSON.parse(JSON.stringify((query as any)._query))
}
