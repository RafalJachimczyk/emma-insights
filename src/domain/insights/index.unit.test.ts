import { mocked } from 'ts-jest/utils'

import { retrieveInsights } from './index';

import { selectInsights } from '../../adapter/postgress/insights';
jest.mock('../../adapter/postgress/insights');
const mockSelectInsights = mocked(selectInsights, true)



describe('insights domain', () => {


    afterEach(function resetMocks() {
        mockSelectInsights.mockReset()
    })

    it('should select insights from postgress', async () => {
        
        let fakeUserId = 'a6016f45-230f-468a-a862-464b1808e582';
        let todayDate = new Date();

        await retrieveInsights(fakeUserId, todayDate);
        expect(mockSelectInsights).toHaveBeenCalledWith(fakeUserId, todayDate);
    });

    it('should eventually resolve with insights', () => {});
});
