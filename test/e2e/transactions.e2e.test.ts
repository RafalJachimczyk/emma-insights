import fetch from 'node-fetch';

import { config } from 'dotenv';

import { insertTestFixtures, deleteTestFixtures} from '../utils/fixtures'

jest.dontMock('pg');
jest.setTimeout(30000);


config();


describe('Transactions API', () => {
    const apiUrl: string = `http://${process.env.API_HOSTNAME}:${process.env.API_PORT}/transactions`;

    describe('POST', () => {
        // let users;
        // let merchants;
        // let usersPrepared;
        // let merchantsPrepared;
        // let transactionsPrepared;

        let fixtures;

        beforeEach(async function setupTestFixtures() {
            fixtures = await insertTestFixtures();
        });

        afterEach(async function cleanupTestFixtures() {
            await deleteTestFixtures(fixtures);
        });

        // it('Should respond with 422 Unprocessable Entity if the posted transaction is invalid format', async () => {
        //     const payload = "I'm not a JSON!";

        //     const response = await fetch(apiUrl, {
        //         method: 'post',
        //         body: payload,
        //     });

        //     expect(response.status).toEqual(415);
        // });

        it('Should accept a single transaction when a POST request made', async () => {
            const payload = fixtures.transactionsPrepared.map((transaction) => {
                return {
                    user_id: transaction[1],
                    merchant_id: transaction[5],
                    date: transaction[2],
                    amount: transaction[3],
                    description: transaction[4],
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


