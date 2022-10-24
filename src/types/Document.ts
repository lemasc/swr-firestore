import type { DocumentSnapshot } from '@firebase/firestore'

type BaseFields = {
  id: string
  hasPendingWrites?: boolean
  __snapshot?: DocumentSnapshot
}

export type ValidatedDocument<
  T extends Record<string, unknown> = Record<string, unknown>
> = BaseFields &
  T & {
    exists: true
    validated: true
  }

type UnvalidatedDocument = BaseFields & {
  exists: boolean
  validated: false
}

export type Document<
  T extends Record<string, unknown> = Record<string, unknown>
> = ValidatedDocument<T> | UnvalidatedDocument

/**
 * Returns true if the given document is existed and validated against the schema.
 */
export const isDocumentValid = <Data extends Record<string, unknown>>(
  doc: Document<Data>
): doc is ValidatedDocument<Data> => {
  return doc.exists && doc.validated
}
