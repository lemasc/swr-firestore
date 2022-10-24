import { getWithDotNotation } from '../dot-notation'
import { parseFieldValue } from './parse'

export const getWithFieldValue = <
  Current extends Record<string, any>,
  Data extends Record<string, any> = Current
>(
  current: Current,
  data: Data,
  path: string,
  allowDotNotation?: boolean
) => {
  const value = getWithDotNotation(data, path, allowDotNotation)
  const fieldValue = parseFieldValue(value)
  // This is not a FieldValue, return immediately.
  if (!fieldValue) return value

  if (fieldValue.type === 'serverTimestamp') {
    return fieldValue.value()
  }
  const currentValue = getWithDotNotation(current, path, allowDotNotation)
  switch (fieldValue.type) {
    case 'arrayUnion':
    case 'arrayRemove':
      const set = new Set(Array.isArray(currentValue) ? currentValue : [])
      fieldValue.value().forEach((v) => {
        fieldValue.type === 'arrayUnion' ? set.add(v) : set.delete(v)
      })
      return Array.from(set.values())
    case 'increment':
      return (value && Number.isFinite(value) ? value : 0) + fieldValue.value()
  }
}
