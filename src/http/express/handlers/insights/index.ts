import { NextFunction, Request, Response } from 'express';

import { retrieveInsights, Insight } from '../../../../domain/insights';

const get = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.query.user_id) {
        res.status(400).json();
        return next();
    }

    let queryDate = req.query.date;

    let userId = req.query.user_id.toString();

    let today = new Date().toISOString().slice(0, 10);
    let date = req.query.date ? new Date(queryDate as string) : new Date(today);

    const insights: Insight[] = await retrieveInsights(userId, date);

    const responseJson = insights.map((insight) => {
        return {
            ...insight,
            date: insight.date.toISOString().slice(0, 10),
        };
    });

    res.json(responseJson);
};

export { get };