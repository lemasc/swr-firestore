import type { DocumentData, QueryDocumentSnapshot } from '@firebase/firestore'

export type Document<T = DocumentData> = T & {
  id: string
  exists?: boolean
  hasPendingWrites?: boolean
  __snapshot?: QueryDocumentSnapshot
}
