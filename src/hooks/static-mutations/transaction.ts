import { runTransaction as _runTransaction } from '@firebase/firestore'
import type { TransactionOptions } from '@firebase/firestore'
import { db } from '../../helpers'
import type { StaticMutateOptions } from '../../types'
import TransactionWithLocalMutations from '../../classes/Transaction'
import { mutate } from 'swr'

/**
 * Runs the Firestore transaction and apply any mutations to SWR if neccessary.
 *
 * Executes the given `updateFunction` and then attempts to commit the changes
 * applied within the transaction. If any document read within the transaction
 * has changed, Cloud Firestore retries the `updateFunction`. If it fails to
 * commit after 5 attempts, the transaction fails.
 *
 * The maximum number of writes allowed in a single transaction is 500.
 *
 * @param updateFunction - The function to execute within the transaction
 * context.
 * @param options - An options object to configure maximum number of attempts to
 * commit.
 * @returns If the transaction completed successfully or was explicitly aborted
 * (the `updateFunction` returned a failed promise), the promise returned by the
 * `updateFunction `is returned here. Otherwise, if the transaction failed, a
 * rejected promise with the corresponding failure error is returned.
 */
export async function runTransaction<T>(
  updateFunction: (transaction: TransactionWithLocalMutations) => Promise<T>,
  options?: TransactionOptions & StaticMutateOptions
): Promise<T> {
  return _runTransaction<T>(
    db(),
    (transaction) => {
      const extendedTransaction = new TransactionWithLocalMutations(
        transaction,
        options?.mutate ?? mutate
      )
      return updateFunction(extendedTransaction)
    },
    options
  )
}
