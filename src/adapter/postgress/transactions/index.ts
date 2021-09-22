import { Transaction } from "../../../domain/transactions"

const storeTransactionsInDatabase = (transactions: Transaction[]): number => {
    return transactions.length
}

export { 
    storeTransactionsInDatabase
}