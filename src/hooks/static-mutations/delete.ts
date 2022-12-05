import { mutate as globalMutate } from 'swr'
import { db } from '../../helpers'
import {
  doc,
  deleteDoc as _deleteDoc,
} from '@lemasc/firebase-wrapper/firestore'
import type { StaticMutateOptions } from '../../types'
import { deleteDocFromCollection } from '../../internals'

const deleteDoc = (
  path: string | null,
  { ignoreLocalMutation, mutate }: StaticMutateOptions = {}
) => {
  if (path === null) return null

  const ref = doc(db(), path)
  const mutateFn = mutate ?? globalMutate
  if (!ignoreLocalMutation) {
    mutateFn(path, null, false)
    deleteDocFromCollection(ref, { mutate })
  }

  return _deleteDoc(ref)
}

export { deleteDoc }
