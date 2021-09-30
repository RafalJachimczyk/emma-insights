import { Pool } from 'pg';

// //TODO: move to defined mock in __mocks__
jest.mock('pg', () => {
    const mClient = {
        query: jest.fn(),
        release: jest.fn(),
    };
    const mPool = {
        connect: jest.fn().mockResolvedValue(mClient),
    };
    return { Pool: jest.fn(() => mPool) };
});

import { selectInsights } from './index';
import { Insight } from '../../../domain/insights';

describe('postgress transactions adapter', () => {
    let mockPool = new Pool();

    it('should select the insights from database with the expected query', async () => {
        let fakeUserId = 'a6016f45-230f-468a-a862-464b1808e582';
        let fakeMerchantId = '57e2388b-c0d2-4cd0-9042-a381d0903a7f';
        let todayDate = new Date();

        const expectedQuery = `
SELECT *
FROM (
        SELECT SUM(i.amount) total_amount,
                PERCENT_RANK() over (
                    PARTITION BY i.merchant_id
                    ORDER BY SUM(i.amount)
                    )         percentile_rank,
                i.user_id,
                i.merchant_id,
                i.date
        FROM public."InsightsDaily" i
        WHERE i.date = '${todayDate.toISOString().slice(0, 10)}'
        GROUP BY i.user_id, i.merchant_id, i.date
        ORDER BY percentile_rank DESC
) as all_ranks
WHERE user_id = '${fakeUserId}';
`;

        const mockClient = await mockPool.connect();
        mockClient.query.mockResolvedValue({
            rows: [
                {
                    user_id: fakeUserId,
                    merchant_id: fakeMerchantId,
                    percentile_rank: 0.999,
                    date: todayDate.toISOString().slice(0, 10),
                },
            ],
        });

        const expectedInsights: Array<Insight> = [
            {
                userId: fakeUserId,
                merchantId: fakeMerchantId,
                percentileRank: 0.999,
                date: new Date(todayDate),
            },
        ];

        const insights = await selectInsights(fakeUserId, todayDate);
        expect(mockPool.connect).toHaveBeenCalled();
        expect(mockClient.query).toHaveBeenCalledWith(expectedQuery, []);
        expect(mockClient.release).toHaveBeenCalled();
        expect(insights).toEqual(expectedInsights);
    });
});
