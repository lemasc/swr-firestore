import { mutate as globalMutate } from 'swr'
import { doc, updateDoc as _updateDoc } from '@firebase/firestore'
import { db, empty } from '../../helpers'

import type { UpdateData } from '@firebase/firestore'
import type { StaticMutateOptions } from '../../types'
import { updateDocFromCache } from '../../internals'

const updateDoc = <Data extends Record<string, unknown>>(
  path: string | null,
  data: UpdateData<Data>,
  { ignoreLocalMutation, mutate }: StaticMutateOptions = {}
) => {
  if (path === null) return null

  const ref = doc(db(), path)

  const mutateFn = mutate ?? globalMutate
  if (!ignoreLocalMutation) {
    mutateFn(
      path,
      (prevState = empty.object) => {
        return {
          ...prevState,
          ...data,
        }
      },
      false
    )

    updateDocFromCache(ref.parent.path, data as any, {
      merge: true,
      mutate,
    })
  }
  return _updateDoc(ref, data)
}

export { updateDoc }
