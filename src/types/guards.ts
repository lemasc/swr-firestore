import type { Timestamp } from '@lemasc/firebase-wrapper/firestore'

export const isTimestamp = (arg: unknown): arg is Timestamp => {
  return (
    arg !== null &&
    typeof arg === 'object' &&
    typeof (arg as Timestamp).nanoseconds === 'number' &&
    typeof (arg as Timestamp).seconds === 'number' &&
    typeof (arg as Timestamp).toDate === 'function'
  )
}
