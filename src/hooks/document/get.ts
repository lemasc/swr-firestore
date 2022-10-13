import { doc, getDoc } from '@firebase/firestore'
import { updateDocFromCache } from '../../internals/cache'
import { db, validateAndParseDate } from '../../helpers'
import type {
  FetchStaticOptions,
  Document,
  StaticMutateOptions,
} from '../../types'

export const getDocument = async <
  Data extends Record<string, unknown> = Record<string, unknown>,
  Doc extends Document<Data> = Document<Data>
>(
  path: string,
  options: FetchStaticOptions<Data> & StaticMutateOptions
) => {
  const document = await getDoc(doc(db(), path))
  const data = await validateAndParseDate<Data, Doc>(document, options)
  updateDocFromCache(document.ref.parent.path, data, options)
  return data
}
