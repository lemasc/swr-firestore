import { mutate as globalMutate } from 'swr'
import type { Key } from 'swr'
import { getKeysFromCache } from '../../internals'
import { StaticSWRConfig } from 'types'

/**
 * Function that, when called, refreshes all queries that match this document path.
 *
 * This can be useful for a pull to refresh that isn't on the same screen as the `useCollection` hook, for example.
 */
const revalidateDocument = (path: Key, mutator?: typeof globalMutate) => {
  return (mutator ?? globalMutate).call(null, path)
}

/**
 * Function that, when called, refreshes all queries that match this document path.
 *
 * This can be useful for a pull to refresh that isn't on the same screen as the `useCollection` hook, for example.
 */
const revalidateCollection = (path: string, { mutate }: StaticSWRConfig) => {
  return Promise.all(
    getKeysFromCache(path).map((key) => revalidateDocument(key, mutate))
  )
}

export { revalidateCollection, revalidateDocument }
