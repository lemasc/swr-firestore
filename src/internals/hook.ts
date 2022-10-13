import type { Fetcher, Key, SWRConfiguration } from 'swr'
import useSWR, { useSWRConfig } from 'swr'
import type { MutableRefObject } from 'react'
import { useEffect, useRef } from 'react'
import type { Unsubscribe } from '@firebase/firestore'
import type { Document, FetchHookOptions } from '../types'

type FetcherResponse<Data = unknown> = Data | Promise<Data>

type ObjectAsRefs<T extends object = {}> = {
  [P in keyof T]: MutableRefObject<T[P]>
}

type InternalState<Data extends Record<string, unknown>> = {
  unsubscribeRef: Unsubscribe | null
  shouldListen: FetchHookOptions<Data>['listen']
  datesToParse: FetchHookOptions<Data>['parseDates']
  shouldIgnoreSnapshot: FetchHookOptions<Data>['ignoreFirestoreDocumentSnapshotField']
  validate: FetchHookOptions<Data>['validator']
}

// We move custom logics that implemented on both hooks here.
export const useFirestoreInternal = <
  Data extends Record<string, unknown> = Record<string, unknown>,
  Doc extends Document = Document<Data>,
  SWRKey extends Key = null,
  SWRReturn extends Doc[] | Doc = Doc
>(
  key: SWRKey,
  fetcher: (
    state: ObjectAsRefs<InternalState<Data>>,
    ...args: Parameters<Fetcher<SWRReturn | null, SWRKey>>
  ) => FetcherResponse<SWRReturn | null>,
  options: FetchHookOptions<Data> & SWRConfiguration<SWRReturn | null>
) => {
  const unsubscribeRef = useRef<Unsubscribe | null>(null)
  const {
    listen = false,
    parseDates,
    ignoreFirestoreDocumentSnapshotField = true,
    validator,
    ...opts
  } = options

  const swrOptions = {
    ...opts,
    ...(listen
      ? // if we're listening, the firestore listener handles all revalidation
        {
          refreshInterval: 0,
          refreshWhenHidden: false,
          refreshWhenOffline: false,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          dedupingInterval: 0,
        }
      : {}),
  }

  // we move listen to a Ref
  // why? because we shouldn't have to include "listen" in the key
  // if we do, then calling mutate() won't be consistent for all
  // documents with the same path.
  const shouldListen = useRef(listen)
  useEffect(() => {
    shouldListen.current = listen
  }, [listen])

  const datesToParse = useRef<any[] | undefined>(parseDates)
  useEffect(() => {
    datesToParse.current = parseDates
  }, [parseDates])

  const shouldIgnoreSnapshot = useRef(ignoreFirestoreDocumentSnapshotField)
  useEffect(() => {
    shouldIgnoreSnapshot.current = ignoreFirestoreDocumentSnapshotField
  }, [ignoreFirestoreDocumentSnapshotField])

  const validate = useRef(validator)
  useEffect(() => {
    validate.current = validator
  }, [validator])

  const { mutate: mutator } = useSWRConfig()

  useEffect(() => {
    return () => {
      // clean up listener on unmount if it exists
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
    // should depend on the key, and listen being the same...
  }, [key, listen])

  const swr = useSWR(
    key,
    (...args) =>
      fetcher(
        {
          shouldListen,
          datesToParse,
          shouldIgnoreSnapshot,
          unsubscribeRef,
          validate,
        },
        ...(args as any)
      ),
    swrOptions
  )

  const { mutate } = swr

  // if listen changes,
  // we run revalidate.
  // This triggers SWR to fetch again
  // Why? because we don't want to put listen or memoQueryString
  // in the useSWR key. If we did, then we couldn't mutate
  // based on path. If we had useSWR(['users', { where: ['name', '==, 'fernando']}]),
  // and we updated the proper `user` dictionary, it wouldn't mutate, because of
  // the key.
  // thus, we move the `listen` and `queryString` options to refs passed to `useSWR`,
  // and we call `revalidate` if either of them change.
  const mounted = useRef(false)
  useEffect(() => {
    if (mounted.current) revalidateRef.current()
    else mounted.current = true
  }, [listen, mutator])

  // this MUST be after the previous effect to avoid duplicate initial validations.
  // only happens on updates, not initial mount.
  const revalidateRef = useRef(mutate)
  useEffect(() => {
    revalidateRef.current = mutate
  })

  return {
    // don't destructure the response as it will lost render optimizations.
    ...swr,
    /**
     * A function that, when called, unsubscribes the Firestore listener.
     *
     * The function can be null, so make sure to check that it exists before calling it.
     *
     * **Note**: This is not necessary to use. The hook already unmounts the listener for you. This is only intended if you want to unsubscribe on your own.
     */
    unsubscribe: unsubscribeRef.current,
  }
}
