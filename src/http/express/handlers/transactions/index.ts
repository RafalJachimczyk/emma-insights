import { NextFunction, Request, Response } from 'express';

import { storeTransactions, Transaction } from '../../../../domain/transactions'

const post = (req: Request, _res: Response, _next: NextFunction) => {

    let transactions: Array<Transaction> = req.body.map((transactionRaw): Transaction => {
        return {
            userId: transactionRaw.user_id,
            merchantId: transactionRaw.merchant_id,
            date: new Date(transactionRaw.date),
            amount: transactionRaw.amount,
            description: transactionRaw.description
        }
    });

    storeTransactions(transactions);
};

export { post };
