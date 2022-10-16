# SWR + Firestore

```js
const { data } = useDocument('users/fernando')
```

This is the fork of [swr-firestore](https://github.com/nandorojo/swr-firestore) with support for Firebase Modular SDK (v9) and improvements.

## Breaking changes with recent versions.
The old version of this library, `swr-firestore-v9`, has been deprecated. Please upgrade to the new package, `@lemasc/swr-firestore`, and has follow the migrations as explained in [CHANGELOG.md](/CHANGELOG.md) and see the new examples below.

**It's that easy.**

🔥 This library provides the hooks you need for querying Firestore, that you can actually use in production, on every screen.

⚡️ It aims to be **the fastest way to use Firestore in a React app,** both from a developer experience and app performance perspective.

🍕 This library is built on top [useSWR](https://swr.vercel.app), meaning you get all of its awesome benefits out-of-the-box.

You can now fetch, add, and mutate Firestore data with zero boilerplate.

## Features

- Shared state / cache between collection and document queries [(instead of Redux??)](#shared-global-state-between-documents-and-collections)
- Works with both **React** and ~~React Native~~. React Native uses namespaced version of Firebase. I'll made a discussion about this soon.
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

This library expects you to intialize Firebase  app with your own. This depends on your Javascript Framework. `@lemasc/swr-firestore` will automatically use your firebase `[DEFAULT]` app instance for initializing firestore.

## Basic Usage

### Subscribe to a document

```tsx
import React from 'react'
import { useDocument } from '@lemasc/swr-firestore'
import { Text } from 'react-native'

export default function User() {
  const user = { id: 'Fernando' }
  const { data, update, error } = useDocument(`users/${user.id}`, {
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

See [API](API.md).

# Features

## First-class TypeScript support

Create a model for your `typescript` types, and pass it as a generic to `useDocument` or `useCollection`. The `data` item returned from the library will automatically be type-safe.

When you first read your document data, properties in your model will not exists, as it hasn't checked as valid yet.

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

Typescript typings will also inferred automatically, if possible.

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

## Query Constraints

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
