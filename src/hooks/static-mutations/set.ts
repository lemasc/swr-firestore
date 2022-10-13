import { mutate as globalMutate } from 'swr'
import { doc, setDoc as _setDoc } from '@firebase/firestore'
import { db, empty } from '../../helpers'

import type { SetOptions } from '@firebase/firestore-types'
import type { Document, StaticMutateOptions } from '../../types'
import { updateDocFromCache } from '../../internals'

const setDoc = <
  Data extends Record<string, unknown>,
  Doc extends Document = Document<Data>
>(
  path: string | null,
  data: Partial<Data>,
  {
    ignoreLocalMutation,
    mutate,
    ...options
  }: SetOptions & StaticMutateOptions = {}
) => {
  if (path === null) return null

  const ref = doc(db(), path)

  const mutateFn = mutate ?? globalMutate
  if (!ignoreLocalMutation) {
    mutateFn(
      path,
      (prevState = empty.object) => {
        if (!options.merge) return data
        return {
          ...prevState,
          ...data,
        }
      },
      false
    )
    updateDocFromCache<Data, Doc>(ref.parent.path, data as any, {
      mutate,
      merge: options.merge,
    })
  }

  return _setDoc(ref, data, options)
}

export { setDoc }
