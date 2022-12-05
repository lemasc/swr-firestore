import { getFirestore } from '@lemasc/firebase-wrapper/firestore'

export const db = () => getFirestore()
