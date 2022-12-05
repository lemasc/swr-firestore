import { mutate as globalMutate } from 'swr'
import {
  doc,
  updateDoc as _updateDoc,
} from '@lemasc/firebase-wrapper/firestore'
import { db, parseUpdateData } from '../../helpers'

import type { UpdateData } from '@lemasc/firebase-wrapper/firestore'
import type { StaticMutateOptions } from '../../types'
import { mutateDocFromCollection } from '../../internals'

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
      (prevState: Data | null) => {
        if (prevState) {
          return parseUpdateData<Data>(prevState, data, {
            merge: true,
            allowDotNotation: true,
          })
        }
        return null
      },
      false
    )

    mutateDocFromCollection(ref, data as any, {
      merge: true,
      mutate,
      allowDotNotation: true,
    })
  }
  return _updateDoc(ref, data)
}

export { updateDoc }
