import setupApp from './app';

jest.mock('./http/express/routing');
import mountRouting from './http/express/routing';

describe('app', () => {
    beforeEach(() => {
        setupApp();
    });

    it('should mount routing', () => {
        expect(mountRouting).toHaveBeenCalled();
    });
});
