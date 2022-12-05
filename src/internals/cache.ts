import { mutate as globalMutate } from 'swr'
import {
  CacheUpdateOptions,
  Document,
  isMergeFieldOptions,
  isMergeOptions,
  StaticSWRConfig,
} from '../types'
import { collectionCache } from '../classes/Cache'
import { parseUpdateData } from '../helpers'
import { DocumentReference } from '@lemasc/firebase-wrapper/firestore'

export const getKeysFromCache = (path: string) => {
  return collectionCache.getSWRKeysFromCollectionPath(path)
}

/**
 * Set or updates the document from the cache.
 */
export const mutateDocFromCollection = <
  Data extends Record<string, any>,
  Doc extends Document<Data> = Document<Data>
>(
  ref: DocumentReference,
  data: Data,
  {
    mutate = globalMutate,
    ...options
  }: StaticSWRConfig & CacheUpdateOptions<Data>
) => {
  const path = ref.parent.path
  const docId = ref.id
  return getKeysFromCache(path).forEach((key) => {
    mutate(
      key,
      (currentState: Doc[]) => {
        // don't mutate the current state if it doesn't include this doc
        // why? to prevent creating a new reference of the state
        // creating a new reference could trigger unnecessary re-renders
        if (!currentState.some((doc) => doc.id === docId)) {
          return currentState
        }
        return currentState.map((document) => {
          if (document.id === data.id) {
            if (isMergeOptions(options) || isMergeFieldOptions(options)) {
              return parseUpdateData(document, data as any, options)
            }
            return data
          }
          return document
        })
      },
      false
    )
  })
}

/**
 * Removes the document from the cache.
 */
export const deleteDocFromCollection = <
  Data extends Record<string, any>,
  Doc extends Document<Data> = Document<Data>
>(
  ref: DocumentReference,
  { mutate = globalMutate }: StaticSWRConfig
) => {
  const path = ref.parent.path
  const docId = ref.id
  return getKeysFromCache(path).forEach((key) => {
    mutate(
      key,
      (currentState: Doc[]): Doc[] => {
        // don't mutate the current state if it doesn't include this doc
        // why? to prevent creating a new reference of the state
        // creating a new reference could trigger unnecessary re-renders
        if (!currentState.some((doc) => doc && doc.id === docId)) {
          return currentState
        }
        return currentState.filter((document) => {
          if (!document) return false
          if (document.id === docId) {
            // delete this doc
            return false
          }
          return true
        })
      },
      false
    )
  })
}
