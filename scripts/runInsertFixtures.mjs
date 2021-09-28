#!/usr/bin/env node

import format from 'pg-format'
import pg from 'pg'
import dotenv from 'dotenv'
import cliProgress from 'cli-progress';

import { generateUsers, generateMerchants, generateTransactions } from './generateFixtures.js'

dotenv.config();

const users = await generateUsers(1000000);
const merchants = await generateMerchants(500000);

var usersPrepared = users.map((user) => {
    return [user.id, user.first_name, user.last_name]
})

var merchantsPrepared = merchants.map((merchant) => {
    return [merchant.id, merchant.display_name, merchant.icon_url, merchant.funny_gif_url]
})

try {

    const pool = new pg.Pool({
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    })
    const client = await pool.connect()

    await insertUsers(client, usersPrepared);

    await insertMerchants(client, merchantsPrepared);

    client.release();


} catch (err) {
    console.log('Error when adding users and merchants!');
    throw err;
}

const insertTransactions = async (batchSize, numBatches, users, merchants, bar) => {

    bar.start(numBatches * batchSize, 0);
    try {
        for (let i = 1; i <= numBatches; i++) {

            // console.log(`[${i}] Generating transactions: ...`);
            const transactions = await generateTransactions(users, merchants, batchSize);
            var transactionsPrepared = transactions.map((transaction) => {
                return [transaction.id, transaction.user.id, transaction.date, transaction.amount, transaction.description, transaction.merchant.id]
            })

            // console.log(`[${i}] Establishing Postgress connection: ...`);
            const pool = new pg.Pool({
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            })
            const client = await pool.connect()

            // console.log(`[${i}] Inserting transactions: ...`)
            let preparedQuery = format('INSERT INTO public."Transactions" (id, user_id, date, amount, description, merchant_id) VALUES %L', transactionsPrepared);
            await client.query(preparedQuery, []);

            client.release()
            bar.update(batchSize * i)
        }
    } catch (err) {
        console.log('Error when adding transactions!');
        throw err;
    }
    bar.stop();
}

const bar = new cliProgress.SingleBar({});

await insertTransactions(2, 100000, users, merchants, bar);


console.log(`Done! 🎉`);