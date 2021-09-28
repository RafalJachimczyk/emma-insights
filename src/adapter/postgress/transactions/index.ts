import { Transaction } from '../../../domain/transactions';
import { Pool } from 'pg';
import format from 'pg-format';

const pool = new Pool({
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

const insertTransactions = async (transactions: Transaction[]): Promise<number> => {
    return new Promise<number>(async (resolve, reject) => {
        try {
            const client = await pool.connect();

            var transactionsPrepared = transactions.map((transaction) => {
                return [
                    transaction.userId,
                    transaction.merchantId,
                    transaction.amount,
                    transaction.date,
                    transaction.description,
                ];
            });

            let preparedQuery = format(
                'INSERT INTO public."Transactions" (user_id, merchant_id, amount, date, description) VALUES %L',
                transactionsPrepared
            );
            
            const result = await client.query(preparedQuery, []);

            client.release();
            
            resolve(result.rowCount);
        } catch (err) {
            reject(err);
        }
    });
};

export { insertTransactions };
