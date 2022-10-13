import { mutate as globalMutate } from 'swr'
import { Document, StaticSWRConfig } from '../types'
import { collectionCache } from '../classes/Cache'

export const getKeysFromCache = (path: string) => {
  return collectionCache.getSWRKeysFromCollectionPath(path)
}

export const updateDocFromCache = <
  Data extends Record<string, any>,
  Doc extends Document<Data> = Document<Data>
>(
  path: string,
  data: Doc,
  { merge, mutate = globalMutate }: StaticSWRConfig & { merge?: boolean }
) => {
  return getKeysFromCache(path).forEach((key) => {
    mutate(
      key,
      (currentState: Doc[]): Doc[] => {
        // don't mutate the current state if it doesn't include this doc
        // why? to prevent creating a new reference of the state
        // creating a new reference could trigger unnecessary re-renders
        if (!currentState.some((doc) => doc.id === data.id)) {
          return currentState
        }
        return currentState.map((document) => {
          if (document.id === data.id) {
            if (merge) {
              return { ...document, ...data }
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

export const removeDocFromCache = <
  Data extends Record<string, any>,
  Doc extends Document<Data> = Document<Data>
>(
  path: string,
  docId: string,
  { mutate = globalMutate }: StaticSWRConfig
) => {
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
