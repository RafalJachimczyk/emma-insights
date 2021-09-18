import {Transaction, calculateInsights} from './calculateInsights';

describe('calculateInsights', () => {


    let userId = '0a8cfe52-d2c7-4623-acb7-92e9a4b0ea31';
    let merchantId = 'eb6a5f3f-0a84-462d-a65a-78f2465719da';

    it('should be a function', () => {
        expect(calculateInsights).toBeInstanceOf(Function);
    });

    it('should calculate insights for given merchant transactions and merchant global total', () => {
        let expected : number = 0.5;
        let globalMerchantAmount : number = 40;

        let transactions = new Array<Transaction>();
        transactions.push(
            {
                userId,
                merchantId,
                amount: 10,
                date: new Date('2021-09-14')
            },
            {
                userId,
                merchantId,
                amount: 10,
                date: new Date('2021-09-14')
            }
        );
        let result : number = calculateInsights(transactions, globalMerchantAmount);

        expect(result).toEqual(expected);
    });

});
