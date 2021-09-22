import { storeTransactionsInDatabase } from '../../adapter/postgress/transactions';

const storeTransactions = (transactions: Transaction[]): number => {
    return storeTransactionsInDatabase(transactions);
};

export { storeTransactions };

export type Transaction = {
    userId: string;
    merchantId: string;
    amount: number;
    date: Date;
    description: string;
};