# CHANGELOG

## v2.0.0
### Breaking changes
- `@lemasc/swr-firestore` no longer requires `Fuego` class and wrapping root component with `FuegoProvider`. It will use the `[DEFAULT]` app instance automatically. Initialize it somewhere before trying to use in your hook.
- Keys are now serialized by SWR, so Cache class logic has been changed. This should not affect your code. Submit an issue if mutation doesn't work.
- `useCollection` no longer constructs query constraints internally, you controls how the constrainsts are created and ordered. Pass constraints to the `constaints` parameter instead.

Before:
```typescript
const { data } = useCollection('users', {
  where: ['name', '==', 'fernando'],
  limit: 10,
  orderBy: ['age', 'desc'],
  listen: true,
})
```
After:
```typescript
import {
  where,
  limit,
  orderBy
} from "@lemasc/swr-firestore/constraints"
// You can also import from '@firebase/firestore'
// but you will lose type check benefits.

const { data } = useCollection('users', {
  // Notice below!
  constraints: [
    where('name', '==', 'fernando'),
    orderBy('age', 'desc'),
    limit(10),
  ],
  listen: true,
})
```

### Improvements
- Refactor library to be more modular.
- Add document schema validator.
- Deduplicate code into `internals` folder.
- Exports the internally used snapshot listener for advanced use cases.
- Serialize Firestore query using the internal `_query` property. This may subject to change in the future.

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
