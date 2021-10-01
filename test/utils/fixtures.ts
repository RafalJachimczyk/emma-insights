import pg from 'pg';

import { generateUsers, generateMerchants, generateTransactions } from '../../scripts/generateFixtures';
import {
    insertUsers,
    insertMerchants,
    deleteUser,
    deleteMerchant,
    deleteTransaction,
} from '../../scripts/postgressFixtures';

export const insertTestFixtures = async (numUsers: number = 1, numMerchants: number = 1, numTransactions: number = 1) => {
    return new Promise(async (resolve, _reject) => {
        let users = await generateUsers(numUsers);
        let merchants = await generateMerchants(numMerchants);

        let usersPrepared = await buildPreparedUsers(users);
        let merchantsPrepared = await buildPreparedMerchants(merchants);

        const pool = new pg.Pool({
            max: 20,
            idleTimeoutMillis: 300000,
            connectionTimeoutMillis: 2000,
        });
        const client = await pool.connect();

        await insertUsers(client, usersPrepared);
        await insertMerchants(client, merchantsPrepared);
        await client.release();
        await pool.end();

        let transactions = await generateTransactions(users, merchants, numTransactions);
        let transactionsPrepared = await buildPreparedTransactions(transactions);

        resolve({
            users,
            merchants,
            transactions,
            usersPrepared,
            merchantsPrepared,
            transactionsPrepared,
        });
    });
};

export const deleteTestFixtures = async (fixtures) => {
    return new Promise(async (resolve, _reject) => {
        const pool = new pg.Pool({
            max: 20,
            idleTimeoutMillis: 300000,
            connectionTimeoutMillis: 2000,
        });
        const client = await pool.connect();
        for (let transaction of fixtures.transactionsPrepared) {
            await deleteTransaction(client, transaction[0]);
        }
        for (let user of fixtures.users) {
            await deleteUser(client, user.id);
        }
        for (let merchant of fixtures.merchants) {
            await deleteMerchant(client, merchant.id);
        }
        await client.release();
        await pool.end();
        resolve({});
    });
};

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

const buildPreparedTransactions = async (transactions) => {
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

