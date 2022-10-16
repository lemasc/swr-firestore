# API

## Imports

```typescript
import {
  useDocument,
  useCollection,
  revalidateDoc,
  revalidateCollection,
  // these all update BOTH Firestore & the local cache ⚡️
  setDoc, // set a firestore document
  updateDoc, // update a firestore document
  getFuego, // get the firebase instance used by this lib
  getDocs, // prefetch a collection, without being hooked into SWR or React
  getDoc, // prefetch a document, without being hooked into SWR or React
} from '@lemasc/swr-firestore'
```

## `useDocument(path, options)`

```js
const {
  data,
  error,
  isValidating,
  mutate,
  unsubscribe
} = useDocument(path, options)
```

### Arguments

- **`path` required** The unique document path for your Firestore document.
  - `string` | `null`. If `null`, the request will not be sent. This is useful if you want to get a user document, but the user ID hasn't loaded yet, for instance.
  - This follows the same pattern as the `key` argument in `useSWR`. See the [SWR docs](https://github.com/zeit/swr#conditional-fetching) for more. Functions are not currently supported for this argument.
- `options` _(optional)_ A dictionary with added options for the query. Takes the folowing values:
  - `listen = false`: If `true`, sets up a listener for this document that updates whenever it changes.
  - You can also pass any of the [options available from `useSWR`](https://github.com/zeit/swr#options).
  - `ignoreFirestoreDocumentSnapshotField = true`. See elaboration below.
  - `parseDates`: An array of string keys that correspond to dates in your document. [Example](#parse-date-fields-in-your-documents).

##### `ignoreFirestoreDocumentSnapshotField`

If `true`, docs returned in `data` will not include the firestore `__snapshot` field. If `false`, it will include a `__snapshot` field. This lets you access the document snapshot, but makes the document not JSON serializable.

By default, it ignores the `__snapshot` field. This makes it easier for newcomers to use `JSON.stringify` without weird errors. You must explicitly set it to `false` to use it.

```js
// include the firestore document snapshots
const { data } = useDocument('users/fernando', {
  ignoreFirestoreDocumentSnapshotField: false,
})

if (data) {
  const path = data.__snapshot.ref.path
}
```

The `__snapshot` field is the exact snapshot returned by Firestore.

See Firestore's [snapshot docs](https://firebase.google.com/docs/reference/js/firebase.firestore.QuerySnapshot) for more.

### Return values

Returns a dictionary with the following values:

- `unsubscribe()` A function that, when called, unsubscribes the Firestore listener.
  - The function can be null, so make sure to check that it exists before calling it.
  - **Note**: This is not necessary to use. `useDocument` already unmounts the listener for you. This is only intended if you want to unsubscribe on your own.

The dictionary also includes the following [from `useSWR`](https://github.com/zeit/swr#return-values):

- `data`: data for the given key resolved by fetcher (or undefined if not loaded)
- `error`: error thrown by fetcher (or undefined)
- `isValidating`: if there's a request or revalidation loading
- `mutate(data?, shouldRevalidate?)`: function to mutate the cached data

## `useCollection(path, query, options)`

```js
const { data, add, error, isValidating, mutate, unsubscribe } = useCollection(
  path,
  query,
  options
)
```

### Arguments

- **`path`** required string, path to collection.
- `query` optional dictionary with Firestore query details
- `options` SWR options [(see SWR docs)](https://github.com/zeit/swr#options)

#### `path`

**`path` required** The unique document path for your Firestore document.

- `string` | `null`. If `null`, the request will not be sent. This is useful if you want to get a user document, but the user ID hasn't loaded yet, for instance.
- This follows the same pattern as the `key` argument in `useSWR`. See the [SWR docs](https://github.com/zeit/swr#conditional-fetching) for more. Functions are not currently supported for this argument.

#### `query`

_(optional)_ Dictionary that accepts any of the following optional values:

- `listen = false`: if true, will set up a real-time listener that automatically updates.
- `limit`: number that limits the number of documents
- [`where`](#where): filter documents by certain conditions based on their fields
- [`orderBy`](#orderBy): sort documents by their fields
- `startAt`: number to start at
- `endAt`: number to end at
- `startAfter`: number to start after
- `endBefore`: number to end before
- `ignoreFirestoreDocumentSnapshotField = true`: If `true`, docs returned in `data` will not include the firestore `__snapshot` field. If `false`, it will include a `__snapshot` field. This lets you access the document snapshot, but makes the document not JSON serializable.

##### `where`

Can be an array, or an array of arrays.

Each array follows this outline: `['key', 'comparison-operator', 'value']`. This is pulled directly from Firestore's [where pattern](https://firebase.google.com/docs/firestore/query-data/queries#query_operators).

```js
// get all users whose names are Fernando
useCollection('users', {
  where: ['name', '==', 'Fernando'],
})

// get all users whose names are Fernando & who are hungry
useCollection('users', {
  where: [
    ['name', '==', 'Fernando'],
    ['isHungry', '==', true],
  ],
})

// get all users whose friends array contains Fernando
useCollection('users', {
  where: ['friends', 'array-contains', 'Fernando'],
})
```

##### `orderBy`

Can be a string, array, or an array of arrays.

Each array follows this outline: `['key', 'desc' | 'asc']`. This is pulled directly from Firestore's [orderBy pattern](https://firebase.google.com/docs/firestore/query-data/order-limit-data).

```js
// get users, ordered by name
useCollection('users', {
  orderBy: 'name',
})

// get users, ordered by name in descending order
useCollection('users', {
  orderBy: ['name', 'desc'],
})

// get users, ordered by name in descending order & hunger in ascending order
useCollection('users', {
  orderBy: [
    ['name', 'desc'], //
    ['isHungry', 'asc'],
  ],
})
```

##### `ignoreFirestoreDocumentSnapshotField`

If `true`, docs returned in `data` will not include the firestore `__snapshot` field. If `false`, it will include a `__snapshot` field. This lets you access the document snapshot, but makes the document not JSON serializable.

By default, it ignores the `__snapshot` field. This makes it easier for newcomers to use `JSON.stringify` without weird errors. You must explicitly set it to `false` to use it.

```js
// include the firestore document snapshots
const { data } = useCollection('users', {
  ignoreFirestoreDocumentSnapshotField: false,
})

if (data) {
  data.forEach(document => {
    const path = document?.__snapshot.ref.path
  })
}
```

The `__snapshot` field is the exact snapshot returned by Firestore.

See Firestore's [snapshot docs](https://firebase.google.com/docs/reference/js/firebase.firestore.QuerySnapshot) for more.

#### `options`

_(optional)_ A dictionary with added options for the request. See the [options available from SWR](https://github.com/zeit/swr#options).

### Return values

Returns a dictionary with the following values:

- `unsubscribe()` A function that, when called, unsubscribes the Firestore listener.
  - The function can be null, so make sure to check that it exists before calling it.
  - **Note**: This is not necessary to use. `useCollection` already unmounts the listener for you. This is only intended if you want to unsubscribe on your own.

The returned dictionary also includes the following [from `useSWR`](https://github.com/zeit/swr#return-values):

- `data`: data for the given key resolved by fetcher (or undefined if not loaded)
- `error`: error thrown by fetcher (or undefined)
- `isValidating`: if there's a request or revalidation loading
- `mutate(data?, shouldRevalidate?)`: function to mutate the cached data

## `setDoc(path, data, SetOptions?)`

Extends the `firestore` document [`setDoc` function](https://firebase.google.com/docs/firestore/manage-data/add-data#set_a_document).

- You can call this when you want to edit your document.
- It also updates the local cache using SWR's `mutate`. This will prove highly convenient over the regular Firestore `setDoc` function.

This is useful if you want to set a document in a component that isn't connected to the `useDocument` hook.

## `updateDoc(path, data)`:

Extends the Firestore document [`updateDoc` function](https://firebase.google.com/docs/firestore/manage-data/add-data#update-data).

- It also updates the local cache using SWR's `mutate`. This will prove highly convenient over the regular `updateDoc` function.

This is useful if you want to update a document in a component that isn't connected to the `useDocument` hook.

## `deleteDoc(path, ignoreLocalMutations = false)`

Extends the Firestore document [`deleteDoc` function](https://firebase.google.com/docs/firestore/manage-data/delete-data).

- It also updates the local cache using SWR's `mutate` by deleting your document from this query and all collection queries that have fetched this document. This will prove highly convenient over the regular `delete` function from Firestore.
- Second argument is a boolean that defaults to false. If `true`, it will not update the local cache, and instead only send delete to Firestore.

## `revalidateDoc(path)`

Refetch a document from Firestore, and update the local cache. Useful if you want to update a given document without calling the connected `revalidate` function from use `useDocument` hook.

- Only argument is the Firestore document path (ex: `users/Fernando`)

## `revalidateCollection(path)`

Refetch a collection query from Firestore, and update the local cache. Useful if you want to update a given collection without calling the connected `revalidate` function from use `useCollection` hook.

- Only argument is the Firestore document path (ex: `users`)
- **Note** Calling `revalidateCollection` will update _all_ collection queries. If you're paginating data for a given collection, you probably won't want to use this function for that collection.

## `getFuego()`

Returns the current firebase instance used by this library. Throws an error if the instance hasn't initialized yet. 

## `getDoc(path, options?)`

If you don't want to use `useDocument` in a component, you can use this function outside of the React scope.

### Arguments

- **`path` required** The unique document path for your Firestore document.
- `options`
  - `ignoreFirestoreDocumentSnapshotField = true`. If `false`, it will return a `__snapshot` field too.
  - `parseDates`: An array of string keys that correspond to dates in your document. [Example](#parse-date-fields-in-your-documents).

### Returns

A promise with the firestore doc and some useful fields. See the [useDocument](#useDocument) `data` return type for more info.

## `getDocs(path, query?, options?)`

If you don't want to use `useCollection` in a component, you can use this function outside of the React scope.

### Arguments

- **`path` required** The unique collection path for your Firestore collection.
  - `ignoreFirestoreDocumentSnapshotField = true`. If `false`, it will return a `__snapshot` field too.
  - `parseDates`: An array of string keys that correspond to dates in your document. [Example](#parse-date-fields-in-your-documents).
- `query` refer to the second argument of [`useCollection`](#useCollection).
- `options`
  - `ignoreFirestoreDocumentSnapshotField = true`. If `false`, it will return a `__snapshot` field too in each document.
  - `parseDates`: An array of string keys that correspond to dates in your documents. [Example](#parse-date-fields-in-your-documents).