import httpMocks, { RequestMethod, MockRequest } from 'node-mocks-http';

import { get as insightsHandler } from './index'

// TODO: fix return type
// const buildRequest = (url: string, method: RequestMethod, body: object): MockRequest => {
const buildRequest = (url: string, method: RequestMethod, body: object) => {
    return httpMocks.createRequest({
        url,
        method,
        body,
    });
}

const buildResponse = () => {
    return httpMocks.createResponse();
}
    

describe('insightsHandler', () => {
    const _next = undefined;
    
    it('should return 400 Bad Request response if no user_id given in req param', () => {
        let req = buildRequest('/insights', 'POST', null);
        let res = buildResponse();

        insightsHandler(req, res, _next);

        expect(res.statusCode).toEqual(400);
    });
});
