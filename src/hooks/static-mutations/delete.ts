import { mutate as globalMutate } from 'swr'
import { db } from '../../helpers'
import { doc, deleteDoc as _deleteDoc } from '@firebase/firestore'
import type { StaticMutateOptions } from '../../types'
import { removeDocFromCache } from '../../internals'

const deleteDoc = (
  path: string | null,
  { ignoreLocalMutation, mutate }: StaticMutateOptions = {}
) => {
  if (path === null) return null

  const ref = doc(db(), path)
  const mutateFn = mutate ?? globalMutate
  if (!ignoreLocalMutation) {
    mutateFn(path, null, false)
    removeDocFromCache(ref.parent.path, ref.id, { mutate })
  }

  return _deleteDoc(ref)
}

export { deleteDoc }
