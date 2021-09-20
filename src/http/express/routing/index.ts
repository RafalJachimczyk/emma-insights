import { get as getInsightHandler } from '../handlers/insights';
import { post as postTransactionsHandler } from '../handlers/transactions';


export default (app) => {
    app.get('/insights', getInsightHandler);
    app.post('/transactions', postTransactionsHandler);
};


