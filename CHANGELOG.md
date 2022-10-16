# CHANGELOG

## v1.x
- Use the stable channel of firebase (v9.1.x)
- Update SWR to version 1.
- useDocument and useCollection won't return `revalidate()` [due to SWR changes](https://swr.vercel.app/blog/swr-v1#change-revalidate-to-mutate).
- API functions renamed for similarity with the new firebase SDK.
  * `set()` is now `setDoc()`
  * `update()` is now `updateDoc()`
  * `deleteDocument()` is now `deleteDoc()`
  * `revalidateDocument()` is now `revalidateDoc()`
  * `getDocument()` is now `getDoc()`
  * `getCollection()` is now `getDocs()`
- Use `getFuego()` to get the current database instance instead of importing `fuego` variable directly.
