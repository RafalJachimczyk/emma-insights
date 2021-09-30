import { Insight } from '../../../domain/insights';
import { Pool } from 'pg';
import format from 'pg-format';

const pool = new Pool({
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

const selectInsights = async (user_id: string, date: Date): Promise<Insight[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            //TODO: make sure we are using Pooling in an optimal way
            const client = await pool.connect();

            let preparedQuery = format(`
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
        WHERE i.date = '%s'
        GROUP BY i.user_id, i.merchant_id, i.date
        ORDER BY percentile_rank DESC
) as all_ranks
WHERE user_id = '%s';
`,
                date.toISOString().slice(0, 10),
                user_id
            );

            const result = await client.query(preparedQuery, []);
            client.release();

            let insights: Array<Insight> = result.rows.map((insight): Insight => {
                return  {
                    userId: insight.user_id,
                    merchantId: insight.merchant_id,
                    percentileRank: insight.percentile_rank,
                    date: date
                }
            });

            resolve(insights);
        } catch (err) {
            reject(err);
        }
    });
};

export { selectInsights };
