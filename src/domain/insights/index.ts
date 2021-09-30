import { selectInsights } from '../../adapter/postgress/insights';

const retrieveInsights = async (user_id: string, date: Date): Promise<Insight[]> => {
    return await selectInsights(user_id, date);
};

export { retrieveInsights };

export type Insight = {
    userId: string;
    merchantId: string;
    percentileRank: number;
    date: Date; //TODO: Fix the date format
};