import { mutate as globalMutate } from 'swr'
import type { Unsubscribe } from '@firebase/firestore'
import { onSnapshot } from '@firebase/firestore'
import type {
  CollectionQueryType,
  Document,
  FetchStaticOptions,
  StaticSWRConfig,
} from '../../types'
import { createQuery, createStableQueryKey } from './query'
import { validateAndParseDate } from '../../helpers'

type ListenerReturnType<Doc extends Document = Document> = {
  initialData: Doc[]
  unsubscribe: Unsubscribe
}

export const createCollectionListener = async <
  Data extends Record<string, unknown>,
  Doc extends Document<Data> = Document<Data>
>(
  path: string,
  query: CollectionQueryType<Data>,
  options: FetchStaticOptions<Data> & Pick<StaticSWRConfig, 'mutate'>
): Promise<ListenerReturnType<Doc>> => {
  return new Promise((resolve) => {
    const ref = createQuery(path, query)
    const key = createStableQueryKey(ref)
    const unsubscribe = onSnapshot(
      ref,
      { includeMetadataChanges: true },
      async (querySnapshot) => {
        const mutateStatic = options.mutate ?? globalMutate
        const data: Doc[] = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const document = await validateAndParseDate<Data, Doc>(doc, options)
            mutateStatic(doc.ref.path, document, false)
            return document
          })
        )
        // resolve initial data
        resolve({
          initialData: data,
          unsubscribe,
        })
        // update on listener fire
        mutateStatic([path, key], data, false)
      }
    )
  })
}
