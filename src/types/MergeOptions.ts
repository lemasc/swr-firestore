export const isMergeFieldOptions = <Data>(
  options: CacheUpdateOptions<Data>
): options is MergeFieldOptions<Data> => {
  return (
    (options as MergeFieldOptions<Data>).mergeFields !== null &&
    Array.isArray((options as MergeFieldOptions<Data>).mergeFields)
  )
}

export const isMergeOptions = <Data>(
  options: CacheUpdateOptions<Data>
): options is MergeOptions => {
  return (
    (options as MergeOptions).merge !== null &&
    (options as MergeOptions).merge === true
  )
}

export type MergeOptions = {
  /**
   * Granular merges instead of overwriting the target documents in their entirety.
   */
  merge: boolean
  /**
   * Allow dot-notation mask fields styles to be updated. Intended to use
   * when updating documents with `updateDoc`.
   */
  allowDotNotation?: boolean
}

type AllowString<T> = T extends string ? T : never

export type MergeFieldOptions<Data extends Record<string, any>> = {
  /**
   * Only replace the specified field paths.
   * Any field path that is not specified is ignored and remains untouched.
   * If your input sets any field to an empty map, all nested fields are overwritten.
   */
  mergeFields: Array<AllowString<keyof Data>>
}

export type CacheUpdateOptions<Data extends Record<string, any>> =
  | Partial<MergeOptions>
  | Partial<MergeFieldOptions<Data>>
