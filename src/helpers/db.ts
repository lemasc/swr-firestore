import { getFirestore } from '@firebase/firestore'

export const db = () => getFirestore()
