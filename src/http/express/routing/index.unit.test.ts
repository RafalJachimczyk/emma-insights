import mountRouting from './index';

import { get as getInsightHandler } from '../handlers/insights';
import { post as postTransactionsHandler } from '../handlers/transactions';

describe('Express - routing', () => {
    let app;

    beforeEach(() => {
        app = {
            get: jest.fn(),
            post: jest.fn(),
        };
    });

    it('should be a function', () => {
        expect(mountRouting).toBeInstanceOf(Function);
    });

    it('should register the insights GET endpoint', () => {
        mountRouting(app);

        expect(app.get).toHaveBeenCalledWith('/insights', getInsightHandler);
    });

    it('should register the transactions POST endpoint', () => {
        mountRouting(app);

        expect(app.post).toHaveBeenCalledWith('/transactions', postTransactionsHandler);
    });    
});
