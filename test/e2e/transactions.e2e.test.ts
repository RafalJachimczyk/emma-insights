import fetch from 'node-fetch';
import { v4 } from 'uuid';
import { config } from 'dotenv';

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
            const payload = [
                {
                    user_id: 'c36da3d0-6f40-4203-a4c7-9b6692f1bc28',
                    merchant_id: '7ff2cf83-1972-437a-b6d5-a9f438a787e0',
                    date: '2011-10-05T14:48:00.000Z',
                    amount: 11.21,
                    description: 'Venti Latte',
                },
            ];

            const response = await fetch(apiUrl, {
                method: 'post',
                body: JSON.stringify(payload),
                headers: {'Content-Type': 'application/json'}

            });
            // const res = await response.json;

            expect(response.status).toEqual(201); //created
            expect(response.body).toEqual({ accepted: 1 });
        });
    });
});
