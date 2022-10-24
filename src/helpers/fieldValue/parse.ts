type FieldValue =
  | {
      type: 'arrayRemove' | 'arrayUnion'
      value: () => any[]
    }
  | {
      type: 'increment'
      value: () => number
    }
  | {
      type: 'serverTimestamp'
      value: () => Date
    }

export const parseFieldValue = (field: any): null | FieldValue => {
  if (field !== null && typeof field === 'object') {
    const type = field._methodName as FieldValue['type'] | undefined
    const value = Object.entries(field).filter(
      ([key]) => key !== '_methodName'
    )?.[0]?.[1]
    if (type !== null && typeof type === 'string') {
      switch (type) {
        case 'arrayRemove':
        case 'arrayUnion':
          if (Array.isArray(value)) {
            return {
              type,
              value: () => value,
            }
          }
          break
        case 'increment':
          if (value && Number.isFinite(value)) {
            return {
              type,
              value: () => value as number,
            }
          }
          break
        case 'serverTimestamp':
          return {
            type,
            value: () => new Date(),
          }
      }
    }
  }
  return null
}
