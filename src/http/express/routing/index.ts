import { get as getInsightHandler } from '../handlers/insights';

export default (app) => {
    app.get('/insights', getInsightHandler);
};


