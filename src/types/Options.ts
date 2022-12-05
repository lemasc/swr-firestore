import { SWRResponse } from 'swr'
import {
  DocumentData,
  DocumentSnapshot,
  Unsubscribe,
} from '@lemasc/firebase-wrapper/firestore'
import type { ScopedMutator } from 'swr/dist/types'

export type StaticSWRConfig = {
  /**
   * If you are using a custom cache provider, pass the mutate function returned from `useSWRConfig`.
   */
  mutate?: ScopedMutator<any>
}

export type StaticMutateOptions = StaticSWRConfig & {
  /**
   * If true, the local cache won't be updated. Default `false`.
   */
  ignoreLocalMutation?: boolean
}

export type ValidatorFn<Data extends Record<string, unknown>> = (
  documentData: DocumentData | undefined,
  snapshot: DocumentSnapshot
) => Data | Promise<Data> | null

export type FetchStaticOptions<Data extends Record<string, unknown>> = {
  /**
   * An array of key strings that indicate where there will be dates in the document.
   *
   * Example: if your dates are in the `lastUpdated` and `user.createdAt` fields, then pass `{parseDates: ["lastUpdated", "user.createdAt"]}`.
   *
   * This will automatically turn all Firestore dates into JS Date objects, removing the need to do `.toDate()` on your dates.
   */
  parseDates?: (keyof Data | string)[]
  /**
   * If `true`, docs returned in `data` will not include the firestore `__snapshot` field. If `false`, it will include a `__snapshot` field. This lets you access the document snapshot, but makes the document not JSON serializable.
   *
   * Default: `true`
   */
  ignoreFirestoreDocumentSnapshotField?: boolean
  /**
   * Validates the data against the schema validator.
   * If an error was thrown or null was returned, the data will be ignored.
   */
  validator?: ValidatorFn<Data>
}

export type FetchHookOptions<Data extends Record<string, unknown>> = {
  /**
   * If `true`, sets up a real-time subscription to the Firestore backend.
   *
   * Default: `false`
   */
  listen?: boolean
} & FetchStaticOptions<Data>

export type FetchHookReturns<Returns> = SWRResponse<Returns, any> & {
  /**
   * A function that, when called, unsubscribes the Firestore listener.
   *
   * The function can be null, so make sure to check that it exists before calling it.
   *
   * **Note**: This is not necessary to use. The hook already unmounts the listener for you. This is only intended if you want to unsubscribe on your own.
   */
  unsubscribe: Unsubscribe | null
}
