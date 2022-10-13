import type { SWRConfiguration } from 'swr'
import { useSWRConfig } from 'swr'
import type { Unsubscribe } from '@firebase/firestore'
import { useRef, useEffect, useMemo } from 'react'
import { useFirestoreInternal } from '../../internals'
import { empty } from '../../helpers'
import { createQuery, createStableQueryKey } from './query'
import { createCollectionListener } from './listener'
import { getCollection } from './get'
import type {
  CollectionQueryType,
  Document,
  FetchHookOptions,
  FetchHookReturns,
} from '../../types'
import { collectionCache } from '../../classes/Cache'

export type CollectionSWROptions<Doc extends Document = Document> =
  SWRConfiguration<Doc[] | null>
/**
 * Call a Firestore Collection
 * @template Doc
 * @param path String if the document is ready. If it's not ready yet, pass `null`, and the request won't start yet.
 * @param [query] - Dictionary with options to query the collection.
 * @param [options] - Dictionary with option `listen`. If true, it will open a socket listener. Also takes any of SWR's options.
 */
export const useCollection = <
  Data extends Record<string, unknown> = Record<string, unknown>,
  Doc extends Document<Data> = Document<Data>
>(
  path: string | null,
  query: CollectionQueryType<Data> = empty.object,
  options: FetchHookOptions<Data> & CollectionSWROptions<Doc> = empty.object
): FetchHookReturns<Doc[] | null> => {
  const unsubscribeRef = useRef<Unsubscribe | null>(null)

  // We use the undocumented `_query` field, which can be serialized to a stable query object.
  // This can subject to change at anytime.
  const stableQueryKey = useMemo<Record<string, any>>(
    () => createStableQueryKey(path ? createQuery(path, query) : null),
    [query, path]
  )

  const { mutate: configMutate } = useSWRConfig()

  const swr = useFirestoreInternal<
    Data,
    Doc,
    [string, Record<string, any>] | null,
    Doc[]
  >(
    // if the path is null, this means we don't want to fetch yet.
    path !== null ? [path, stableQueryKey] : null,
    async (
      { shouldIgnoreSnapshot, shouldListen, datesToParse, validate },
      path
    ) => {
      if (shouldListen.current) {
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
          unsubscribeRef.current = null
        }
        const { unsubscribe, initialData } = await createCollectionListener<
          Data,
          Doc
        >(path, query, {
          parseDates: datesToParse.current,
          ignoreFirestoreDocumentSnapshotField: shouldIgnoreSnapshot.current,
          mutate: configMutate,
          validator: validate.current,
        })
        unsubscribeRef.current = unsubscribe
        return initialData
      }

      const data = await getCollection<Data, Doc>(path, query, {
        parseDates: datesToParse.current as never[],
        ignoreFirestoreDocumentSnapshotField: shouldIgnoreSnapshot.current,
        mutate: configMutate,
        validator: validate.current,
      })
      return data
    },
    options
  )

  // this MUST be after the previous effect to avoid duplicate initial validations.
  // only happens on updates, not initial mounting
  const revalidateRef = useRef(swr.mutate)
  useEffect(() => {
    revalidateRef.current = swr.mutate
  })

  // add the collection to the cache,
  // so that we can mutate it from document calls later
  useEffect(() => {
    if (path) collectionCache.addCollectionToCache(path, stableQueryKey)
  }, [path, stableQueryKey])

  return swr
}
