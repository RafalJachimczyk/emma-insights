import fetch from 'node-fetch';
import {config} from 'dotenv'

config();

describe('Insights API', () => {

    const apiUrl: string = `http://${process.env.API_HOSTNAME}:${process.env.API_PORT}/insights`

    it('Should respond with 400 Bad Request if user_id query param not suppied', async () => {
        
        const response = await fetch(apiUrl);
        const statusCode = await response.status;

        expect(statusCode).toEqual(400);
    });
});