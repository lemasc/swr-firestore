import { FirebaseOptions, getApp, getApps, initializeApp } from '@firebase/app'
import { getFirestore, Firestore } from '@firebase/firestore'
export class Fuego {
  public db: Firestore
  constructor(config: FirebaseOptions) {
    this.db = !getApps().length
      ? getFirestore(initializeApp(config))
      : getFirestore(getApp())
  }
}
