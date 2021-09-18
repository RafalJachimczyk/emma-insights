export const calculateInsights = (transactions: Transaction[], globalMerchantAmount: number): number => {
    let totalUserMerchantSpent: number = transactions.map((transaction) => {
        return transaction.amount
    }).reduce((acc, amount) => {
        return acc+amount
    });

    return totalUserMerchantSpent / globalMerchantAmount;
}

export type  Transaction= { 
    userId: string;
    merchantId: string;
    amount: number;
    date: Date;
};