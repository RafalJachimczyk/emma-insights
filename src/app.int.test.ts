import request from 'supertest';

import setupApp from './app';

describe('app', () => {

    let app;

    beforeEach(() => {
        app = setupApp();
    });

    describe('when dealing with unrecognised routes, the closing middleware', () => {
        it('should return a 404 status code', async () => {
            const response = await request(app).get('/route-that-does-not-exist');

            expect(response.status).toBe(404);
        });
    });
});
