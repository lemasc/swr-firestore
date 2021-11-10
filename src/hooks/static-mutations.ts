import { mutate } from 'swr'
import type {
  DocumentData,
  PartialWithFieldValue,
  SetOptions,
  UpdateData,
} from '@firebase/firestore'
import {
  doc,
  collection,
  setDoc as _setDoc,
  updateDoc as _updateDoc,
  deleteDoc as _deleteDoc,
} from '@firebase/firestore'
import { fuego } from '../context/Provider'
import { empty } from '../helpers/empty'
import { collectionCache } from '../classes/Cache'
import { Document } from '../types/Document'

type MergeType = {
  merge?: boolean
}

const shouldMerge = (options: SetOptions | undefined): options is MergeType => {
  return !!(options as MergeType)?.merge
}

/**
 * Function that, when called, refreshes all queries that match this document path.
 *
 * This can be useful for a pull to refresh that isn't on the same screen as the `useCollection` hook, for example.
 */
const revalidateDoc = (path: string) => {
  return mutate(path)
}

/**
 * Function that, when called, refreshes all queries that match this document path.
 *
 * This can be useful for a pull to refresh that isn't on the same screen as the `useCollection` hook, for example.
 */
const revalidateCollection = (path: string) => {
  const promises: Promise<any>[] = []
  collectionCache.getSWRKeysFromCollectionPath(path).forEach((key) => {
    promises.push(mutate(key))
  })
  return Promise.all(promises)
}

const setDoc = <
  Data extends DocumentData,
  Doc extends Document = Document<Data>
>(
  path: string | null,
  data: PartialWithFieldValue<Data>,
  options: SetOptions = {},
  /**
   * If true, the local cache won't be updated. Default `false`.
   */
  ignoreLocalMutation = false
) => {
  if (path === null) return null

  const isDocument = path.trim().split('/').filter(Boolean).length % 2 === 0

  if (!ignoreLocalMutation) {
    mutate(
      path,
      (prevState = empty.object) => {
        if (shouldMerge(options)) return data
        return {
          ...prevState,
          ...data,
        }
      },
      false
    )
  }

  const ref = isDocument ? doc(fuego.db, path) : doc(collection(fuego.db, path))

  collectionCache
    .getSWRKeysFromCollectionPath(ref.parent.path)
    .forEach((key) => {
      mutate(
        key,
        (currentState: Doc[] = empty.array) => {
          // don't mutate the current state if it doesn't include this doc
          // why? to prevent creating a new reference of the state
          // creating a new reference could trigger unnecessary re-renders
          if (!currentState.some((doc) => doc.id === ref.id)) {
            return currentState
          }
          return currentState.map((document = empty.object as Doc) => {
            if (document.id === ref.id) {
              if (!shouldMerge(options)) return document
              return { ...document, ...data }
            }
            return document
          })
        },
        false
      )
    })
  return _setDoc(doc(fuego.db, path), data, options)
}

const updateDoc = <
  Data extends DocumentData,
  Doc extends Document = Document<Data>
>(
  path: string | null,
  data: UpdateData<Data>,
  /**
   * If true, the local cache won't be updated. Default `false`.
   */
  ignoreLocalMutation = false
) => {
  if (path === null) return null
  const isDocument = path.trim().split('/').filter(Boolean).length % 2 === 0

  if (!isDocument)
    throw new Error(
      `[@nandorojo/swr-firestore] error: called update function with path: ${path}. This is not a valid document path. 
      
data: ${JSON.stringify(data)}`
    )

  if (!ignoreLocalMutation) {
    mutate(
      path,
      (prevState = empty.object) => {
        return {
          ...prevState,
          ...data,
        }
      },
      false
    )
  }

  let collection: string | string[] = path.split(`/`).filter(Boolean)
  const docId = collection.pop() // remove last item, which is the /doc-id
  collection = collection.join('/')

  collectionCache.getSWRKeysFromCollectionPath(collection).forEach((key) => {
    mutate(
      key,
      (currentState: Doc[] = empty.array): Doc[] => {
        // don't mutate the current state if it doesn't include this doc
        if (!currentState.some((doc) => doc.id === docId)) {
          return currentState
        }
        return currentState.map((document = empty.object as Doc) => {
          if (document.id === docId) {
            return { ...document, ...data }
          }
          return document
        })
      },
      false
    )
  })
  return _updateDoc(doc(fuego.db, path), data)
}

const deleteDoc = <
  Data extends DocumentData,
  Doc extends Document = Document<Data>
>(
  path: string | null,
  /**
   * If true, the local cache won't be updated immediately. Default `false`.
   */
  ignoreLocalMutation = false
) => {
  if (path === null) return null

  const isDocument = path.trim().split('/').filter(Boolean).length % 2 === 0

  if (!isDocument)
    throw new Error(
      `[@nandorojo/swr-firestore] error: called delete() function with path: ${path}. This is not a valid document path.`
    )

  if (!ignoreLocalMutation) {
    mutate(path, null, false)

    let collection: string | string[] = path.split(`/`).filter(Boolean)
    const docId = collection.pop() // remove last item, which is the /doc-id
    collection = collection.join('/')

    collectionCache.getSWRKeysFromCollectionPath(collection).forEach((key) => {
      mutate(
        key,
        (currentState: Doc[] = empty.array) => {
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

  return _deleteDoc(doc(fuego.db, path))
}

export {
  setDoc,
  updateDoc,
  deleteDoc,
  revalidateDoc,
  revalidateCollection,
  shouldMerge,
}
