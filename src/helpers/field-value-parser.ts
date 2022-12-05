import type { CacheUpdateOptions } from '../types'
import { isMergeFieldOptions, isMergeOptions } from '../types'
import set from 'lodash/set'
import { getWithFieldValue } from './fieldValue/set'
import { setWithDotNotation } from './dot-notation'
import { UpdateData } from '@lemasc/firebase-wrapper/firestore'

/**
 * Returns the updated data that parses common FieldValue values
 * and merge any fields from source document.
 * Designed to be used for mutating Firestore documents locally.
 */
export const parseUpdateData = <
  Current extends Record<string, unknown>,
  Data extends Record<string, unknown> = Current
>(
  current: Current,
  data: UpdateData<Data>,
  options: CacheUpdateOptions<Data>
): Current => {
  const doc = { ...current }
  if (isMergeFieldOptions(options)) {
    options.mergeFields.forEach((field) => {
      set(doc, field, getWithFieldValue(current, data, field))
    })
  } else if (isMergeOptions(options)) {
    for (const field in data) {
      setWithDotNotation(
        doc,
        field,
        getWithFieldValue(current, data, field, options.allowDotNotation),
        options.allowDotNotation
      )
    }
  }
  return doc
}
