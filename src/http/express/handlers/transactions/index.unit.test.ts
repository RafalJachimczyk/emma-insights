import httpMocks, { RequestMethod, MockRequest } from 'node-mocks-http';

import { post as transactionsHandler } from './index';

// TODO: fix return type
// const buildRequest = (url: string, method: RequestMethod, body: object): MockRequest => {
const buildRequest = (url: string, method: RequestMethod, body: object) => {
    return httpMocks.createRequest({
        url,
        method,
        body,
    });
};

const buildResponse = () => {
    return httpMocks.createResponse();
};

describe('transactionsHandler', () => {
    const _next = undefined;

    it('should return 415 Unsupported Media Type response if data is not JSON', () => {
        let req = buildRequest('/transactions', 'POST', { body: "I'm not a JSON" });
        let res = buildResponse();

        transactionsHandler(req, res, _next);

        expect(res.statusCode).toEqual(415);
    });
});
