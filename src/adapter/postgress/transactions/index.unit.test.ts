import { Pool } from 'pg';

//TODO: move to defined mock in __mocks__
jest.mock('pg', () => {
    const mClient = {
        query: jest.fn(),
        release: jest.fn(),
    }
    const mPool = {
        connect: jest.fn().mockResolvedValue(mClient),
    };
    return { Pool: jest.fn(() => mPool) };
});

import { insertTransactions } from './index';
import { Transaction } from '../../../domain/transactions';

describe('postgress transactions adapter', () => {

    let mockPool = new Pool();

    it('should store the transactions in database with the expected query', async () => {
        const expectedQuery = "INSERT INTO public.\"Transactions\" (user_id, merchant_id, amount, date, description) VALUES ('546ff29f-3736-4790-8c0f-eea0ed0e8cb7', 'e6c41e61-4b07-4cb3-90ef-c6fd3910a748', '10', '2021-09-14 00:00:00.000+00', 'Grande americano'), ('546ff29f-3736-4790-8c0f-eea0ed0e8cb7', '49302ab7-2bcd-4a8b-8ec0-7d04c201770d', '10', '2021-09-14 00:00:00.000+00', 'Avocado toast')";

        const mockClient = await mockPool.connect();
        mockClient.query.mockResolvedValue({
            rowCount: 2,
        });

        const transactions = new Array<Transaction>();
        transactions.push(
            {
                userId: '546ff29f-3736-4790-8c0f-eea0ed0e8cb7',
                merchantId: 'e6c41e61-4b07-4cb3-90ef-c6fd3910a748',
                amount: 10,
                date: new Date('2021-09-14'),
                description: 'Grande americano',
            },
            {
                userId: '546ff29f-3736-4790-8c0f-eea0ed0e8cb7',
                merchantId: '49302ab7-2bcd-4a8b-8ec0-7d04c201770d',
                amount: 10,
                date: new Date('2021-09-14'),
                description: 'Avocado toast',
            }
        );

        const numInserted: number = await insertTransactions(transactions);
        expect(mockPool.connect).toHaveBeenCalled();
        expect(mockClient.query).toHaveBeenCalledWith(expectedQuery, []);
        expect(mockClient.release).toHaveBeenCalled();
        expect(numInserted).toEqual(2);
    });
});
