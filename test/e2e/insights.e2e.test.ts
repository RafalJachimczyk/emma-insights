import fetch from 'node-fetch';
import { config } from 'dotenv';

import { insertTestFixtures, deleteTestFixtures } from '../utils/fixtures';

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

    it('Should respond with correct daily insight percentile for a given set of transactions, user_id, merchant_id and date', async () => {
        let fixtures;
        fixtures = await insertTestFixtures(2, 1, 2);

        let userOneId = fixtures.users[0].id;
        let userTwoId = fixtures.users[1].id;

        let merchantId = fixtures.merchants[0].id;

        const payload = [
            {
                user_id: userOneId,
                merchant_id: merchantId,
                date: '2021-09-29',
                amount: '10.00',
                description: fixtures.transactions[0].description,
            },
            {
                user_id: userTwoId,
                merchant_id: merchantId,
                date: '2021-09-29',
                amount: '5.00',
                description: fixtures.transactions[1].description,
            },
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
        const responseJson = await response.json()
        const statusCode = await response.status;

        expect(statusCode).toEqual(200);
        expect(responseJson).toEqual(expectedResponseJson);

        await deleteTestFixtures(fixtures);
    });
});
