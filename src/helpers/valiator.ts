import type { DocumentSnapshot } from '@firebase/firestore'
import { Document, FetchStaticOptions } from '../types'
import { withDocumentDatesParsed } from './doc-date-parser'
import { isDev } from './is-dev'
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
  let docData: Data | undefined = undefined
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
    (docData.exists ||
      docData.validated ||
      docData.id ||
      docData.hasPendingWrites)
  ) {
    console.warn(
      '[@lemasc/swr-firestore] warning: Your document, ',
      document.id,
      ' is using one of the following reserved fields: [exists, id, validated, hasPendingWrites]. These fields are reserved. Please remove them from your documents.'
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
