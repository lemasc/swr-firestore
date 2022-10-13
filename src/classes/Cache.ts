import { unstable_serialize } from 'swr'
import { empty } from '../helpers/empty'

type Collections = {
  [path: string]: {
    key: string
  }[]
}

/**
 * Collection cache
 *
 * This helps us keep track of which collections have been created.
 *
 * Whenever we edit a document, we then check the collection cache to see which collections we should also update.
 */
class CollectionCache {
  private collections: Collections
  constructor() {
    this.collections = {}
  }

  getSWRKeysFromCollectionPath(path: string): string[] {
    const isCollection = path.trim().split('/').filter(Boolean).length % 2 !== 0
    if (!isCollection) {
      console.error(
        `[fuego-swr-keys-from-collection-path] error: Passed a path that was not a collection to useCollection: ${path}.`
      )
    }
    return this.collections[path]?.map(({ key }) => key) ?? empty.array
  }

  addCollectionToCache(path: string, query: Record<string, any>) {
    // As of swr v1.1.0, keys are now serialized automatically.
    // Use the `unstable_serialize` function to get the correct key.
    const key = unstable_serialize([path, query])
    const collectionAlreadyExistsInCache = this.collections[path]?.some(
      ({ key: cachedKey }) => cachedKey === key
    )
    if (!collectionAlreadyExistsInCache) {
      this.collections = {
        ...this.collections,
        [path]: [
          ...(this.collections[path] ?? empty.array),
          {
            key,
          },
        ],
      }
    }
    return this.collections
  }
}

export const collectionCache = new CollectionCache()
