import fetch from 'node-fetch';
import { config } from 'dotenv';

import { insertTestFixtures, deleteTestFixtures } from '../utils/fixtures';
import { Insight } from '../../src/domain/insights'

jest.dontMock('pg');
jest.setTimeout(5000);

config();

describe('Insights API', () => {
    const transactionsApiUrl: string = `http://${process.env.API_HOSTNAME}:${process.env.API_PORT}/transactions`;
    const insightsApiUrl: string = `http://${process.env.API_HOSTNAME}:${process.env.API_PORT}/insights`;

    it('Should respond with 400 Bad Request if user_id query param is not supplied', async () => {
        const response = await fetch(insightsApiUrl);
        const statusCode = await response.status;

        expect(statusCode).toEqual(400);
    });

    describe('Should respond with correct daily insight percentile for a given set of transactions, user_id and date', () => {
        it('for 2 users, 1 merchant and 2 transactions', async () => {
            let fixtures;
            fixtures = await insertTestFixtures(2, 1, 2);

            let userOneId = fixtures.users[0].id;
            let userTwoId = fixtures.users[1].id;

            let merchantId = fixtures.merchants[0].id;

            //TODO: Fix fixtures cleanup. Use the id when inserting in db!
            const payload = [
                {
                    id: fixtures.transactions[0].id,
                    user_id: userOneId,
                    merchant_id: merchantId,
                    date: '2021-09-29',
                    amount: '10.00',
                    description: fixtures.transactions[0].description,
                },
                {
                    id: fixtures.transactions[1].id,
                    user_id: userTwoId,
                    merchant_id: merchantId,
                    date: '2021-09-29',
                    amount: '5.00',
                    description: fixtures.transactions[1].description,
                }
            ];

            await fetch(transactionsApiUrl, {
                method: 'post',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' },
            });

            const expectedResponseJson = [
                {
                    userId: userOneId,
                    merchantId: merchantId,
                    percentileRank: 1,
                    date: '2021-09-29',
                },
            ];

            const response = await fetch(insightsApiUrl + `?user_id=${userOneId}&date=2021-09-29`);
            const responseJson = await response.json();
            const statusCode = await response.status;

            expect(statusCode).toEqual(200);
            expect(responseJson).toEqual(expectedResponseJson);

            // await deleteTestFixtures(fixtures);
        });

        it('for 3 users, 1 merchant and 5 transactions', async () => {
            let fixtures;
            fixtures = await insertTestFixtures(3, 1, 5);

            let userOneId = fixtures.users[0].id;
            let userTwoId = fixtures.users[1].id;
            let userThreeId = fixtures.users[2].id;

            let merchantId = fixtures.merchants[0].id;

            //TODO: Fix fixtures cleanup. Use the id when inserting in db!
            const payload = [
                {
                    id: fixtures.transactions[0].id,
                    user_id: userOneId,
                    merchant_id: merchantId,
                    date: '2021-09-29',
                    amount: '10.00',
                    description: fixtures.transactions[0].description,
                },
                {
                    id: fixtures.transactions[1].id,
                    user_id: userTwoId,
                    merchant_id: merchantId,
                    date: '2021-09-29',
                    amount: '5.00',
                    description: fixtures.transactions[1].description,
                },
                {
                    id: fixtures.transactions[2].id,
                    user_id: userOneId,
                    merchant_id: merchantId,
                    date: '2021-09-29',
                    amount: '5.00',
                    description: fixtures.transactions[2].description,
                },
                {
                    id: fixtures.transactions[3].id,
                    user_id: userTwoId,
                    merchant_id: merchantId,
                    date: '2021-09-29',
                    amount: '7.00',
                    description: fixtures.transactions[3].description,
                },
                {
                    id: fixtures.transactions[4].id,
                    user_id: userThreeId,
                    merchant_id: merchantId,
                    date: '2021-09-29',
                    amount: '10.00',
                    description: fixtures.transactions[4].description,
                },                               
            ];

            await fetch(transactionsApiUrl, {
                method: 'post',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' },
            });

            const expectedResponseJson = [
                {
                    userId: userTwoId,
                    merchantId: merchantId,
                    percentileRank: 0.5,
                    date: '2021-09-29',
                },
            ];

            const response = await fetch(insightsApiUrl + `?user_id=${userTwoId}&date=2021-09-29`);
            const responseJson = await response.json();
            const statusCode = await response.status;

            expect(statusCode).toEqual(200);
            expect(responseJson).toEqual(expectedResponseJson);

            // await deleteTestFixtures(fixtures);
        });

        it('for 3 users, 1 merchant and 5 transactions', async () => {
            let fixtures;
            fixtures = await insertTestFixtures(3, 2, 5);

            let userOneId = fixtures.users[0].id;
            let userTwoId = fixtures.users[1].id;

            let merchantOneId = fixtures.merchants[0].id;
            let merchantTwoId = fixtures.merchants[1].id;

            //TODO: Fix fixtures cleanup. Use the id when inserting in db!
            const payload = [
                {
                    id: fixtures.transactions[0].id,
                    user_id: userOneId,
                    merchant_id: merchantOneId,
                    date: '2021-09-29',
                    amount: '10.00',
                    description: fixtures.transactions[0].description,
                },
                {
                    id: fixtures.transactions[1].id,
                    user_id: userOneId,
                    merchant_id: merchantTwoId,
                    date: '2021-09-29',
                    amount: '5.00',
                    description: fixtures.transactions[1].description,
                },
                {
                    id: fixtures.transactions[2].id,
                    user_id: userOneId,
                    merchant_id: merchantOneId,
                    date: '2021-09-29',
                    amount: '5.00',
                    description: fixtures.transactions[2].description,
                },
                {
                    id: fixtures.transactions[3].id,
                    user_id: userTwoId,
                    merchant_id: merchantOneId,
                    date: '2021-09-29',
                    amount: '17.00',
                    description: fixtures.transactions[3].description,
                },
                {
                    id: fixtures.transactions[4].id,
                    user_id: userTwoId,
                    merchant_id: merchantTwoId,
                    date: '2021-09-29',
                    amount: '10.00',
                    description: fixtures.transactions[4].description,
                },                               
            ];

            await fetch(transactionsApiUrl, {
                method: 'post',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' },
            });

            const expectedResponseJson = [
                {
                    userId: userTwoId,
                    merchantId: merchantOneId,
                    percentileRank: 1,
                    date: '2021-09-29',
                },
                {
                    userId: userTwoId,
                    merchantId: merchantTwoId,
                    percentileRank: 1,
                    date: '2021-09-29',
                },                
            ];

            const response = await fetch(insightsApiUrl + `?user_id=${userTwoId}&date=2021-09-29`);
            const responseJson = await response.json();
            const statusCode = await response.status;

            const responseInsights = responseJson as Array<Insight>;

            expect(statusCode).toEqual(200);
            expect(responseInsights.sort()).toEqual(expectedResponseJson.sort());

            // await deleteTestFixtures(fixtures);
        });
    });
});
