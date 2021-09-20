import fetch from 'node-fetch';
import {v4} from 'uuid'
import {config} from 'dotenv'

config();

describe('Transactions API', () => {

    const apiUrl: string = `http://${process.env.API_HOSTNAME}:${process.env.API_PORT}/transactions`

    it('Should respond with 415 Unsupported Media Type if the posted data is not in the correct format', async () => {
        
        const payload = "I'm not a JSON!";

        const response = await fetch(apiUrl, {
            method: 'post',
            body: payload
        });
        const statusCode = await response.status;

        expect(statusCode).toEqual(415);
    });
});