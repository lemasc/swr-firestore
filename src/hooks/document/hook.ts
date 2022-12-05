import type { SWRConfiguration } from 'swr'
import { useSWRConfig } from 'swr'
import { useRef } from 'react'
import { Unsubscribe } from '@lemasc/firebase-wrapper/firestore'
import { empty } from '../../helpers'
import { useFirestoreInternal } from '../../internals'
import { createDocumentListener } from './listener'
import { getDocument } from './get'
import type { Document, FetchHookOptions, FetchHookReturns } from '../../types'

export const useDocument = <
  Data extends Record<string, unknown> = Record<string, unknown>,
  Doc extends Document<Data> = Document<Data>
>(
  path: string | null,
  options: FetchHookOptions<Data> & SWRConfiguration<Doc | null> = empty.object
): FetchHookReturns<Doc | null> => {
  const unsubscribeRef = useRef<Unsubscribe | null>(null)
  const { mutate } = useSWRConfig()

  return useFirestoreInternal<Data, Doc, string | null>(
    path,
    async (
      { shouldListen, shouldIgnoreSnapshot, datesToParse, validate },
      path
    ) => {
      if (shouldListen.current) {
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
          unsubscribeRef.current = null
        }
        const { unsubscribe, initialData } = await createDocumentListener<
          Data,
          Doc
        >(path, {
          parseDates: datesToParse.current,
          ignoreFirestoreDocumentSnapshotField: shouldIgnoreSnapshot.current,
          mutate,
          validator: validate.current,
        })
        unsubscribeRef.current = unsubscribe
        return initialData
      }
      const data = await getDocument<Data, Doc>(path, {
        parseDates: datesToParse.current,
        ignoreFirestoreDocumentSnapshotField: shouldIgnoreSnapshot.current,
        validator: validate.current,
        mutate,
      })
      return data
    },
    options
  )
}
