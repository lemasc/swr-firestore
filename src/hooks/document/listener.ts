import { mutate as globalMutate } from 'swr'
import type { Unsubscribe } from '@lemasc/firebase-wrapper/firestore'
import { doc, onSnapshot } from '@lemasc/firebase-wrapper/firestore'
import { db, validateAndParseDate } from '../../helpers'
import type { FetchStaticOptions, Document, StaticSWRConfig } from '../../types'
import { mutateDocFromCollection } from '../../internals'

type ListenerReturnType<Doc extends Document = Document> = {
  initialData: Doc
  unsubscribe: Unsubscribe
}

export const createDocumentListener = async <
  Data extends Record<string, unknown>,
  Doc extends Document<Data> = Document<Data>
>(
  path: string,
  options: FetchStaticOptions<Data> & StaticSWRConfig
): Promise<ListenerReturnType<Doc>> => {
  return await new Promise((resolve) => {
    const mutate = options.mutate ?? globalMutate
    const unsubscribe = onSnapshot(doc(db(), path), async (doc) => {
      const data = await validateAndParseDate<Data, Doc>(doc, options)
      mutate(path, data, false)
      mutateDocFromCollection(doc.ref, data, options)

      // the first time the listener fires, we resolve the promise with initial data
      resolve({
        initialData: data,
        unsubscribe,
      })
    })
  })
}
