import { insertTransactions } from '../../adapter/postgress/transactions';

const storeTransactions = async (transactions: Transaction[]): Promise<number> => {
    return await insertTransactions(transactions);
};

export { storeTransactions };

export type Transaction = {
    userId: string;
    merchantId: string;
    amount: number;
    date: Date;
    description: string;
};