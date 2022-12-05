import type { DocumentData } from '@lemasc/firebase-wrapper/firestore'
import get from 'lodash/get'
import set from 'lodash/set'
import { isTimestamp } from '../types'

export function withDocumentDatesParsed<
  Data extends DocumentData = DocumentData
>(data?: Data, parseDates?: (keyof Data | string)[]): Data {
  const doc = { ...(data ?? {}) }
  parseDates?.forEach((dateField) => {
    if (typeof dateField !== 'string') return

    const unparsedDate = get(doc, dateField)
    if (unparsedDate && isTimestamp(unparsedDate)) {
      set(doc, dateField, unparsedDate.toDate())
    }
  })

  return doc as Data
}
