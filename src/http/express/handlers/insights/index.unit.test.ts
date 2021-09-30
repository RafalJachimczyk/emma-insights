import { mocked } from 'ts-jest/utils';
import httpMocks, { RequestMethod, MockRequest } from 'node-mocks-http';

import { get as getInsightsHandler } from './index';

import { retrieveInsights, Insight } from '../../../../domain/insights';
jest.mock('../../../../domain/insights');
const mockRetrieveInsights = mocked(retrieveInsights, true);

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

describe('insightsHandler', () => {
    const next = jest.fn();

    let fakeUserId = 'a6016f45-230f-468a-a862-464b1808e582';
    let fakeMerchantId = '3357f870-1ba8-45de-b791-2eed7eaf8872';

    beforeEach(function setupMocks() {
        let fakeInsights: Array<Insight> = [
            {
                userId: fakeUserId,
                merchantId: fakeMerchantId,
                percentileRank: 0.999,
                date: new Date('2011-10-05'),
            },
        ];

        mockRetrieveInsights.mockResolvedValue(fakeInsights);
    });

    afterEach(function cleanMocks() {
        mockRetrieveInsights.mockReset();
    })

    it('should return 400 Bad Request response if no user_id given in req param', () => {
        let req = buildRequest('/insights', 'GET', null);
        let res = buildResponse();

        getInsightsHandler(req, res, next);

        expect(res.statusCode).toEqual(400);
    });

    it("should retrieve insights for a given user_id and today's date if date param not given", () => {
        let fakeUserId = 'a6016f45-230f-468a-a862-464b1808e582';
        let today = new Date().toISOString().slice(0, 10);
        let todayDate = new Date(today);
        let req = buildRequest(`/insights?user_id=${fakeUserId}`, 'GET', null);
        let res = buildResponse();

        getInsightsHandler(req, res, next);

        expect(mockRetrieveInsights).toHaveBeenCalledWith(fakeUserId, todayDate);
    });

    it('should retrieve insights for a given user_id and date', () => {
        let fakeUserId = 'a6016f45-230f-468a-a862-464b1808e582';
        let todayDate = new Date();

        let req = buildRequest(
            `/insights?user_id=${fakeUserId}&date=${todayDate.toISOString()}`,
            'GET',
            null
        );
        let res = buildResponse();

        getInsightsHandler(req, res, next);

        expect(mockRetrieveInsights).toHaveBeenCalledWith(fakeUserId, todayDate);
    });

    it('should respond with expected insights for given user_id and date', async () => {

        let todayDate = new Date();

        let req = buildRequest(
            `/insights?user_id=${fakeUserId}&date=${todayDate.toISOString()}`,
            'GET',
            null
        );
        let res = buildResponse();

        let fakeInsights: Array<Insight> = [
            {
                userId: fakeUserId,
                merchantId: fakeMerchantId,
                percentileRank: 0.999,
                date: new Date('2011-10-05'),
            },
        ];

        mockRetrieveInsights.mockResolvedValue(fakeInsights);

        await getInsightsHandler(req, res, next);

        let expectedResponse = [
            {
                userId: fakeUserId,
                merchantId: fakeMerchantId,
                percentileRank: 0.999,
                date: new Date('2011-10-05').toISOString().slice(0, 10),
            },
        ];

        expect(res._getJSONData()).toEqual(expectedResponse);
    });
});
