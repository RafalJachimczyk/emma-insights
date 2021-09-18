#!/usr/bin/env node

import format from 'pg-format'
import pg from 'pg'
import dotenv from 'dotenv'
import cliProgress from 'cli-progress';

import { generateUsers, generateMerchants, generateTransactions } from './generateFixtures.mjs'

dotenv.config();

const users = await generateUsers(1000);
const merchants = await generateMerchants(500);

var usersPrepared = users.map((user) => {
    return [user.id, user.first_name, user.last_name]
})

var merchantsPrepared = merchants.map((merchant) => {
    return [merchant.id, merchant.display_name, merchant.icon_url, merchant.funny_gif_url]
})




try {
    const client = new pg.Client()
    await client.connect()

    await client.query(format('INSERT INTO public."Users" (id, first_name, last_name) VALUES %L', usersPrepared), []);

    await client.query(format('INSERT INTO public."Merchants" (id, display_name, icon_url, funny_gif_url) VALUES %L', merchantsPrepared), []);

    await client.end();
} catch (err) {
    console.log('Error when adding users and merchants!');
    throw err;
}




const insertTransactions = async (batchSize, batchNumber, users, merchants, bar) => {

    bar.start(batchNumber * batchSize, 0);
    try {
        for (let i = 1; i <= batchNumber; i++) {

            // console.log(`[${i}] Generating transactions: ...`);
            const transactions = await generateTransactions(users, merchants, batchSize);
            var transactionsPrepared = transactions.map((transaction) => {
                return [transaction.id, transaction.user.id, transaction.date, transaction.amount, transaction.description, transaction.merchant.id]
            })

            // console.log(`[${i}] Establishing Postgress connection: ...`);
            const client = new pg.Client()
            await client.connect()

            // console.log(`[${i}] Inserting transactions: ...`)
            await client.query(format('INSERT INTO public."Transactions" (id, user_id, date, amount, description, merchant_id) VALUES %L', transactionsPrepared), []);

            await client.end();
            bar.update(batchSize * i)
        }
    } catch (err) {
        console.log('Error when adding transactions!');
        throw err;
    }
    bar.stop();
}

const bar = new cliProgress.SingleBar({});

await insertTransactions(1000, 1000, users, merchants, bar);


console.log(`Done! 🎉`);

