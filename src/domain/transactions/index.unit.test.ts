import { mocked } from 'ts-jest/utils'

import { storeTransactions, Transaction } from './index';

import { insertTransactions } from '../../adapter/postgress/transactions';
jest.mock('../../adapter/postgress/transactions');
const mockInsertTransactions = mocked(insertTransactions, true)



describe('transactions domain', () => {


    afterEach(function resetMocks() {
        mockInsertTransactions.mockReset()
    })

    it('should store transactions in postgress', async () => {
        let fakeTransactions: Array<Transaction> = [
            {
                userId: 'c36da3d0-6f40-4203-a4c7-9b6692f1bc28',
                merchantId: '7ff2cf83-1972-437a-b6d5-a9f438a787e0',
                date: new Date('2011-10-05T14:48:00.000Z'),
                amount: 11.21,
                description: 'Venti Latte',
            },
        ];

        mockInsertTransactions.mockResolvedValueOnce(1);
        
        let storedTransactionsNumber = await storeTransactions(fakeTransactions);
        expect(mockInsertTransactions).toHaveBeenCalledWith(fakeTransactions);
        expect(storedTransactionsNumber).toEqual(1);
    });
});
