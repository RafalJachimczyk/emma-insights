const { mocker } = require('mocker-data-generator');

var user = {
    id: {
        chance: 'guid',
    },
    first_name: {
        faker: 'name.firstName',
    },
    last_name: {
        faker: 'name.lastName',
    },
};
var merchant = {
    id: {
        chance: 'guid',
    },
    display_name: {
        faker: 'company.companyName',
    },
    icon_url: {
        faker: 'image.imageUrl',
    },
    funny_gif_url: {
        faker: 'image.imageUrl',
    },
};
var transaction = {
    id: {
        chance: 'guid',
    },
    user: {
        hasOne: 'users',
    },
    date: {
        faker: "date.between('2017-01-01', '2021-09-17')",
    },
    amount: {
        faker: 'finance.amount',
    },
    description: {
        faker: 'finance.transactionDescription',
    },
    merchant: {
        hasOne: 'merchants',
    },
};

const generateUsers = async (num) => {
    return new Promise((resolve, reject) => {
        mocker()
            .schema('users', user, num)
            .build()
            .then(
                (data) => {
                    resolve(data.users);
                },
                (err) => reject(err)
            );
    })

};

const generateMerchants = async (num) => {
    return new Promise((resolve, reject) => {
        mocker()
            .schema('merchants', merchant, num)
            .build()
            .then(
                (data) => {
                    resolve(data.merchants);
                },
                (err) => reject(err)
            );
    });
};

const generateTransactions = async (users, merchants, num) => {
    return new Promise((resolve, reject) => {

        mocker()
            .schema('transactions', transaction, num)
            .seed('users', users)
            .seed('merchants', merchants)
            .build()
            .then(
                data => {
                    resolve(data.transactions);
                },
                err => reject(err)
            )

    });
};

module.exports = {
    generateMerchants,
    generateUsers,
    generateTransactions
}