import { mutate as globalMutate } from 'swr'
import { doc, setDoc as _setDoc } from '@firebase/firestore'
import { db, empty, parseUpdateData } from '../../helpers'

import type { PartialWithFieldValue } from '@firebase/firestore'
import {
  CacheUpdateOptions,
  Document,
  isMergeFieldOptions,
  isMergeOptions,
  StaticMutateOptions,
} from '../../types'
import { mutateDocFromCollection } from '../../internals'

const setDoc = <
  Data extends Record<string, unknown>,
  Doc extends Document = Document<Data>
>(
  path: string | null,
  data: PartialWithFieldValue<Data>,
  {
    ignoreLocalMutation,
    mutate,
    ...options
  }: CacheUpdateOptions<Data> & StaticMutateOptions = {}
) => {
  if (path === null) return null

  const ref = doc(db(), path)

  const mutateFn = mutate ?? globalMutate
  if (!ignoreLocalMutation) {
    mutateFn(
      path,
      (prevState = empty.object) => {
        if (isMergeOptions(options) || isMergeFieldOptions(options)) {
          return parseUpdateData(prevState, data as any, options)
        }
        return prevState
      },
      false
    )
    mutateDocFromCollection<Data, Doc>(ref, data as any, {
      mutate,
      ...options,
    })
  }

  return _setDoc(ref, data, options)
}

export { setDoc }
