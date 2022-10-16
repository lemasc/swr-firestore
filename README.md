# SWR + Firestore

```js
const { data } = useDocument('users/fernando')
```

This is the fork of [swr-firestore](https://github.com/nandorojo/swr-firestore) with support for Firebase Modular SDK (v9) and inprovements.

## Breaking changes with recent versions.
The old version of this library, `swr-firestore-v9`, has been deprecated. Please upgrade to the new package, `@lemasc/swr-firestore`, and has follow the migrations as explained in [CHANGELOG.md](/CHANGELOG.md) and see the new examples below.

**It's that easy.**

🔥 This library provides the hooks you need for querying Firestore, that you can actually use in production, on every screen.

⚡️ It aims to be **the fastest way to use Firestore in a React app,** both from a developer experience and app performance perspective.

🍕 This library is built on top [useSWR](https://swr.vercel.app), meaning you get all of its awesome benefits out-of-the-box.

You can now fetch, add, and mutate Firestore data with zero boilerplate.

## Features

- Shared state / cache between collection and document queries [(instead of Redux??)](#shared-global-state-between-documents-and-collections)
- Works with both **React** and ~~React Native~~. React Native use namespaced version of Firebase. I'll made a discussion about this soon.
- Offline mode with Expo [(without detaching!)](https://github.com/nandorojo/expo-firestore-offline-persistence/blob/master/README.md#usage-with-nandorojoswr-firestore)
- Blazing fast
- Query collection groups (**new** in `0.14.x`!)
- `set`, `update`, and `add` update your global cache, instantly
- TypeScript-ready [(see docs)](#typescript-support)
- Realtime subscriptions [(example)](#simple-examples)
- Prevent memory leaks from Firestore subscriptions
- No more parsing `document.data()` from Firestore requests
- Server-side rendering (SSR or SSG) with Next.js [(example)](https://github.com/nandorojo/swr-firestore/issues/17)
- Automatic date parsing (no more `.toDate()`)

...along with the features touted by Vercel's incredible [SWR](https://github.com/zeit/swr#introduction) library:

_"With SWR, components will get a stream of data updates constantly and automatically. Thus, the **UI will be always fast and reactive**."_

- Transport and protocol agnostic data fetching
- Fast page navigation
- Revalidation on focus
- Interval polling
- Request deduplication
- Local mutation
- Pagination
- TypeScript ready
- SSR support
- Suspense mode
- Minimal API


## Installation

```sh
yarn add @lemasc/swr-firestore

# or
npm install @lemasc/swr-firestore
```

Install firebase:

```sh
# if you're using expo:
expo install firebase

# if you aren't using expo:
yarn add firebase
# or
npm i firebase
```
This library is tree-shakable. Means that if parts of the library that doesn't import to your code won't be included in your bundle too.

## Setup

This library expects you to intialize Firebase  app with your own. This depends on your Javascript Framework. `@lemasc/swr-firestore` will automatically use your firebase `[DEFAULT]` instance for initializing firestore.

## Basic Usage

Examples are written in TypeScript. Remove types if you are using vanilla JavaScript.

### Subscribe to a document

```tsx
import React from 'react'
import { useDocument } from '@lemasc/swr-firestore'
import { Text } from 'react-native'

type UserProfile = {
  name: string,
  email: string,
  isAdmin?: boolean
}

export default function User() {
  const user = { id: 'Fernando' }
  const { data, update, error } = useDocument<User>(`users/${user.id}`, {
    listen: true,
  })

  if (error) return <Text>Error!</Text>
  if (!data) return <Text>Loading...</Text>

  return <Text>Name: {data.name}</Text>
}
```

### Get a collection

```tsx
import React from 'react'
import { useCollection } from 'swr-firestore-v9'
import { Text } from 'react-native'

export default function UserList() {
  const { data, error } = useCollection<User>(`users`)

  if (error) return <Text>Error!</Text>
  if (!data) return <Text>Loading...</Text>

  return data.map(user => <Text key={user.id}>{user.name}</Text>)
}
```

`useDocument` accepts a document `path` as its first argument here. `useCollection` works similarly.

## Simple examples

### Query a users collection:

```typescript
const { data } = useCollection('users')
```

### Subscribe for real-time updates:

```typescript
const { data } = useDocument(`users/${user.id}`, { listen: true })
```

### Make a complex collection query:

**Notice that we are importing from `@lemasc/swr-firestore/constraints`!** For more information, see [Query Constraints](#query-constraints) for more information.

```typescript
import {
  where,
  limit,
  orderBy
} from "@lemasc/swr-firestore/constraints"

const { data } = useCollection('users', {
  constraints: [
    where('name', '==', 'fernando'),
    orderBy('age', 'desc'),
    limit(10),
  ],
  listen: true,
})
```

### Pass options from SWR to your document query:

```typescript
// pass SWR options
const { data } = useDocument('albums/nothing-was-the-same', {
  shouldRetryOnError: false,
  onSuccess: console.log,
  loadingTimeout: 2000,
})
```
### Pass options from SWR to your collection query:

```typescript
// pass SWR options
const { data } = useCollection(
  'albums',
  {
    listen: true,
    constraints: [
      where('artist', '==', 'Drake'),
      where('year', '==', '2020'),
    ],
  },
  {
    shouldRetryOnError: false,
    onSuccess: console.log,
    loadingTimeout: 2000,
  }
)
```

### Use dynamic fields in a request:

If you pass `null` as the collection or document key, the request won't send.

Once the key is set to a string, the request will send.

**Get list of users who have you in their friends list**

```typescript
import { useDoormanUser } from 'react-doorman'

const { uid } = useDoormanUser()
const { data } = useCollection(uid ? 'users' : null, {
  where: ['friends', 'array-contains', uid],
})
```

**Get your favorite song**

```typescript
const me = { id: 'fernando' }

const { data: user } = useDocument<{ favoriteSong: string }>(`users/${me.id}`)

// only send the request once the user.favoriteSong exists!
const { data: song } = useDocument(
  user?.favoriteSong ? `songs/${user.favoriteSong}` : null
)
```

### Parse date fields in your documents

Magically turn any Firestore timestamps into JS date objects! No more `.toDate()`.

Imagine your `user` document schema looks like this:

```typescript
type User = {
  name: string
  lastUpdated: {
    date: Date
  }
  createdAt: Date
}
```

In order to turn `createdAt` and `lastUpdated.date` into JS objects, just use the `parseDates` field:

**In a document query**

```typescript
const { data } = useDocument<User>('user/fernando', {
  parseDates: ['createdAt', 'lastUpdated.date'],
})

let createdAt: Date
if (data) {
  // ✅ all good! it's a JS Date now.
  createdAt = data.createdAt
}
```

`data.createdAt` and `data.lastUpdated.date` are both JS dates now!

**In a collection query**

```typescript
const { data } = useCollection<User>('user', {
  parseDates: ['createdAt', 'lastUpdated.date'],
})

if (data) {
  data.forEach(document => {
    document.createdAt // JS date!
  })
}
```

For more explanation on the dates, see [issue #4](https://github.com/nandorojo/swr-firestore/issues/4).

### Access a document's Firestore snapshot

If you set `ignoreFirestoreDocumentSnapshotField` to `false`, you can access the `__snapshot` field.

```js
const { data } = useDocument('users/fernando', {
  ignoreFirestoreDocumentSnapshotField: false, // default: true
})

if (data) {
  const id = data?.__snapshot.id
}
```

You can do the same for `useCollection` and `useCollectionGroup`. The snapshot will be on each item in the `data` array.

This comes in handy when you are working with forms for data edits:

**With Formik**
```js
const { data, set } = useDocument('users/fernando', {
  ignoreFirestoreDocumentSnapshotField: false,
})

if (!data) return <Loading />

<Formik
  initialValues={data.__snapshot.data()}
  ...
/>
```

**With state and hooks**
```js
const { data, set } = useDocument('users/fernando', {
  ignoreFirestoreDocumentSnapshotField: false,
})

const [values, setValues] = useState(null);

useEffect(() => {
  if (data) {
    setValues(data.__snapshot.data());
  }
}, [data]);
```

<!--
### Paginate a collection:

Video [here](https://imgur.com/a/o9AlI4N).

```typescript
import React from 'react'
import { fuego, useCollection } from '@lemasc/swr-firestore'

const collection = 'dump'
const limit = 1
const orderBy = 'text'

export default function Paginate() {
  const { data, mutate } = useCollection<{ text: string }>(
    collection,
    {
      limit,
      orderBy,
      // 🚨 this is required to get access to the snapshot!
      ignoreFirestoreDocumentSnapshotField: false,
    },
    {
      // this lets us update the local cache + paginate without interruptions
      revalidateOnFocus: false,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      refreshInterval: 0,
    }
  )

  const paginate = async () => {
    if (!data?.length) return

    const ref = fuego.db.collection(collection)

    // get the snapshot of last document we have right now in our query
    const startAfterDocument = data[data.length - 1].__snapshot

    // get more documents, after the most recent one we have
    const moreDocs = await ref
      .orderBy(orderBy)
      .startAfter(startAfterDocument)
      .limit(limit)
      .get()
      .then(d => {
        const docs = []
        d.docs.forEach(doc => docs.push({ ...doc.data(), id: doc.id, __snapshot: doc }))
        return docs
      })

    // mutate our local cache, adding the docs we just added
    // set revalidate to false to prevent SWR from revalidating on its own
    mutate(state => [...state, ...moreDocs], false)
  }

  return data ? (
    <div>
      {data.map(({ id, text }) => (
        <div key={id}>{text}</div>
      ))}
      <button onClick={paginate}>paginate</button>
    </div>
  ) : (
    <div>Loading...</div>
  )
}
```
-->

## Query Documents

You'll rely on `useDocument` to query documents.

```js
import React from 'react'
import { useDocument } from '@lemasc/swr-firestore'

const user = { id: 'Fernando' }
export default () => {
  const { data, error } = useDocument(`users/${user.id}`)
}
```

If you want to set up a listener (or, in Firestore-speak, `onSnapshot`) just set `listen` to `true`.

```js
const { data, error } = useDocument(`users/${user.id}`, { listen: true })
```

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

# Features

## TypeScript Support

Create a model for your `typescript` types, and pass it as a generic to `useDocument` or `useCollection`. The `data` item returned from the library will automatically be type-safe.

When you first read your document data, properties in your model will not existed yet, as it hasn't checked as valid yet.


To make properties on your model accessible, you must check if the document is `exists` and `validated`.

```typescript
import { useDocument } from '@lemasc/swr-firestore'

type User = {
  name: string
}

const { data } = useDocument<User>('users/fernando')

if (!data) {
  // The data hasn't been fetched by the hook yet. Check your SWR key.
  return null;
}

const id = data.id // string
const exists = data.exists // boolean
const validated = data.validated // boolean
const hasPendingWrites = data.hasPendingWrites // boolean

const name = data.name // error!
// Propery 'name' doesn't existed on type 'Document<User>'

if (data.exists && data.validated) {
  const name = data.name // string, the property is now accessible.
}
```

You can check this by your own, or you can use the utility function `isDocumentValid` for more convenience.

```typescript
import {
  isDocumentValid,
  useDocument 
  } from '@lemasc/swr-firestore'

type User = {
  name: string
}

const { data } = useCollection<User>('users')

if (data) {
  // DON'T DO THIS!
  data.forEach(({ id, name }) => {
    // error: Property 'name' doesn't exist on type `Document<User>`.
  });

  // Instead, do this.
  data.filter(isDocumentValid).forEach(({ id, name }) => {
    // ...
  })
}
```

### Validate using the schema validator.

For advanced use cases, you might have a document schema using the library of your choice, and you would like to validate it against the schema.

`@lemasc/swr-firestore` allows you to validate the current document data, transform if necessary, and returned back the corrected one. This is a good practice. You define your document schema, and prevent incompleted documents from breaking your applications.

Typescript typings will also infered automatically, if possible.

If validator returns an object, then the object will be used as a document data. If a falsy value or error was returned, the document data will be undefined.


```tsx
/// You can use any library of your choice.
import { z } from "zod"

const User = z.object({
  username: z.string(),
});

const { data } = useCollection("users", {
  listen: true
}, {
  validator: async (data) => {
    return User.parse(data)
  }
})
// User collections is now validated against the schema.
```

To check if the document is valid, you can check the `validated` prop, or use the utility function `isDocumentValid` as shown earlier.

### Query Constraints

To be documented.

## Shared global state between documents and collections

A great feature of this library is shared data between documents and collections. Until now, this could only be achieved with something like a verbose Redux set up.

So, what does this mean exactly?

Simply put, any documents pulled from a Firestore request will update the global cache.

**To make it clear, let's look at an example.**

Imagine you query a `user` document from Firestore:

```js
const { data } = useDocument('users/fernando')
```

And pretend that this document's `data` returns the following:

```json
{ "id": "fernando", "isHungry": false }
```

_Remember that `isHungry` is `false` here ^_

Now, let's say you query the `users` collection anywhere else in your app:

```js
const { data } = useCollection('users')
```

And pretend that this collection's `data` returns the following:

```json
[
  { "id": "fernando", "isHungry": true },
  {
    //...
  }
]
```

Whoa, `isHungry` is now true. But what happens to the original document query? Will we have stale data?

**Answer:** It will automatically re-render with the new data!

`swr-firestore` uses document `id` fields to sync any collection queries with existing document queries across your app.

That means that **if you somehow fetch the same document twice, the latest version will update everywhere.**

## License

MIT
