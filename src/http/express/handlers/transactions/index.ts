import { NextFunction, Request, Response } from 'express';

import { storeTransactions, Transaction } from '../../../../domain/transactions'

const post = async(req: Request, res: Response, _next: NextFunction) => {

    let transactions: Array<Transaction> = req.body.map((transactionRaw): Transaction => {
        return {
            userId: transactionRaw.user_id,
            merchantId: transactionRaw.merchant_id,
            date: new Date(transactionRaw.date),
            amount: transactionRaw.amount,
            description: transactionRaw.description
        }
    });

    let stored =  await storeTransactions(transactions);
    res.status(201);

    res.json(generateResponseBody(stored));

};

const generateResponseBody = (accepted) => {
    return {
        accepted
    };
};

export { post };
