import httpMocks, { RequestMethod, MockRequest } from 'node-mocks-http';

import { post as postTransactionsHandler } from './index';

import { storeTransactions as mockStoreTransactions, Transaction } from '../../../../domain/transactions'

jest.mock('../../../../domain/transactions');

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

    // it('should return 415 Unsupported Media Type response if data is not JSON', () => {
    //     let req = buildRequest('/transactions', 'POST', { body: "I'm not a JSON" });
    //     let res = buildResponse();

    //     transactionsHandler(req, res, _next);

    //     expect(res.statusCode).toEqual(415);
    // });

    it('should store the transaction', async () => {

        let fakeRawTransactions = [
            {
                user_id: 'c36da3d0-6f40-4203-a4c7-9b6692f1bc28',
                merchant_id: '7ff2cf83-1972-437a-b6d5-a9f438a787e0',
                date: '2011-10-05T14:48:00.000Z',
                amount: 11.21,
                description: 'Venti Latte',
            },
        ]

        let fakeTransactions: Array<Transaction> = [
            {
                userId: 'c36da3d0-6f40-4203-a4c7-9b6692f1bc28',
                merchantId: '7ff2cf83-1972-437a-b6d5-a9f438a787e0',
                date: new Date('2011-10-05T14:48:00.000Z'),
                amount: 11.21,
                description: 'Venti Latte',
            },
        ]

        let req = buildRequest('/transactions', 'POST', fakeRawTransactions);
        let res = buildResponse();

        postTransactionsHandler(req, res, _next);

        expect(mockStoreTransactions).toHaveBeenCalledWith(fakeTransactions);

    });
});
