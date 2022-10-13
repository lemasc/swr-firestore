import type {
  DocumentData,
  DocumentSnapshot,
  Timestamp,
} from '@firebase/firestore'
import get from 'lodash.get'
import set from 'lodash.set'
import type { Document, FetchStaticOptions } from '../types'
import { isDev } from './is-dev'

export function withDocumentDatesParsed<
  Data extends DocumentData = DocumentData
>(data?: Data, parseDates?: (keyof Data | string)[]): Data {
  const doc = { ...(data ?? {}) }
  parseDates?.forEach((dateField) => {
    if (typeof dateField !== 'string') return

    const unparsedDate = get(doc, dateField)
    if (unparsedDate) {
      const parsedDate: Date | undefined = (
        unparsedDate as Timestamp
      ).toDate?.()
      if (parsedDate) {
        set(doc, dateField, parsedDate)
      }
    }
  })

  return doc as Data
}

/**
 * Gets the data from the snapshot, parse dates if neccessary,
 * and validates against the schema.
 */
export const validateAndParseDate = async <
  Data extends Record<string, unknown> = Record<string, unknown>,
  Doc extends Document<Data> = Document<Data>
>(
  document: DocumentSnapshot,
  {
    validator = (data) => data as Data,
    ignoreFirestoreDocumentSnapshotField,
    parseDates,
  }: FetchStaticOptions<Data>
): Promise<Doc> => {
  let docData = undefined
  try {
    const validatedData = await validator(
      withDocumentDatesParsed(
        document.data({
          serverTimestamps: 'estimate',
        }) as Data,
        parseDates
      ),
      document
    )
    if (validatedData) {
      docData = validatedData
    }
  } catch {}
  if (
    isDev &&
    docData &&
    (docData.exists || docData.id || docData.hasPendingWrites)
  ) {
    console.warn(
      '[@lemasc/swr-firestore] warning: Your document, ',
      document.id,
      ' is using one of the following reserved fields: [exists, id, hasPendingWrites]. These fields are reserved. Please remove them from your documents.'
    )
  }
  return {
    ...(docData
      ? {
          validated: true,
          ...docData,
        }
      : {
          validated: false,
        }),
    id: document.id,
    exists: document.exists(),
    hasPendingWrites: document.metadata.hasPendingWrites,
    __snapshot: ignoreFirestoreDocumentSnapshotField ? undefined : document,
  } as Doc
}
