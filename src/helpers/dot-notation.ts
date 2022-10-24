import get from 'lodash/get'
import set from 'lodash/set'

// lodash get and set functions parse dot notation automatically.
// however we want this to be an option. users must provide explicitly.

export const getWithDotNotation = (
  data: Record<string, any>,
  path: string,
  allowDotNotation?: boolean
) => {
  return allowDotNotation ? get(data, path) : data[path]
}

export const setWithDotNotation = (
  data: Record<string, any>,
  path: string,
  value: any,
  allowDotNotation?: boolean
) => {
  // we can mutate directly
  allowDotNotation ? set(data, path, value) : (data[path] = value)
}
