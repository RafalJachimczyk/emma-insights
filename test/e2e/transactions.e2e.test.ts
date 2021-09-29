import fetch from 'node-fetch';
import pg from 'pg';
import { config } from 'dotenv';

jest.dontMock('pg');

import { generateUsers, generateMerchants, generateTransactions } from '../../scripts/generateFixtures.js';
import { insertUsers, insertMerchants } from '../../scripts/insertFixtures';

config();

describe('Transactions API', () => {
    const apiUrl: string = `http://${process.env.API_HOSTNAME}:${process.env.API_PORT}/transactions`;

    describe('POST', () => {
        // it('Should respond with 422 Unprocessable Entity if the posted transaction is invalid format', async () => {
        //     const payload = "I'm not a JSON!";

        //     const response = await fetch(apiUrl, {
        //         method: 'post',
        //         body: payload,
        //     });

        //     expect(response.status).toEqual(415);
        // });

        it('Should accept a single transaction when a POST request made', async () => {
            let users = await generateUsers(1);
            let merchants = await generateMerchants(1);

            let usersPrepared = await buildPreparedUsers(users);
            let merchantsPrepared = await buildPreparedMerchants(merchants);

            const pool = new pg.Pool({
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });
            const client = await pool.connect();

            await insertUsers(client, usersPrepared);
            await insertMerchants(client, merchantsPrepared)

            await client.release();

            let transactionsPrepared = await buildPreparedTransactions(users, merchants, 1);

            const payload = transactionsPrepared.map((transaction) => {
                return {
                    user_id: transaction[1],
                    merchant_id: transaction[5],
                    date: transaction[2],
                    amount: transaction[3],
                    description: transaction[4]
                };
            });

            const response = await fetch(apiUrl, {
                method: 'post',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' },
            });
            const res = await response.json();

            expect(response.status).toEqual(201); //created
            expect(res).toEqual({ accepted: 1 });
        });
    });
});

const buildPreparedUsers = async (users) => {
    var usersPrepared = users.map((user) => {
        return [user.id, user.first_name, user.last_name];
    });
    return usersPrepared;
};

const buildPreparedMerchants = async (merchants) => {
    var merchantsPrepared = merchants.map((merchant) => {
        return [merchant.id, merchant.display_name, merchant.icon_url, merchant.funny_gif_url];
    });
    return merchantsPrepared;
};

const buildPreparedTransactions = async (users, merchants, num: number) => {
    const transactions = await generateTransactions(users, merchants, num);
    var transactionsPrepared = transactions.map((transaction) => {
        return [
            transaction.id,
            transaction.user.id,
            transaction.date,
            transaction.amount,
            transaction.description,
            transaction.merchant.id,
        ];
    });
    return transactionsPrepared;
};
