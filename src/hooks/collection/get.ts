import { mutate as globalMutate } from 'swr'
import { getDocs } from '@firebase/firestore'
import { createQuery } from './query'
import { empty, validateAndParseDate } from '../../helpers'
import type {
  CollectionQueryType,
  Document,
  FetchStaticOptions,
  StaticSWRConfig,
} from '../../types'

export const getCollection = async <
  Data extends Record<string, unknown>,
  Doc extends Document<Data> = Document<Data>
>(
  path: string,
  query: CollectionQueryType<Data> = empty.object,
  options: FetchStaticOptions<Data> & Pick<StaticSWRConfig, 'mutate'>
) => {
  const ref = createQuery(path, query)
  const mutateStatic = options.mutate ?? globalMutate
  const data: Doc[] = await getDocs(ref).then((querySnapshot) => {
    return Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const document = await validateAndParseDate<Data, Doc>(doc, options)
        // update individual docs in the cache
        mutateStatic(doc.ref.path, document, false)
        return document
      })
    )
  })
  return data
}
