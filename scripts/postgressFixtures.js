const format = require('pg-format');

const insertUsers = async (client, usersPrepared) => {
    return await client.query(format('INSERT INTO public."Users" (id, first_name, last_name) VALUES %L', usersPrepared), []);
}

const insertMerchants = async (client, merchantsPrepared) => {
    return await client.query(format('INSERT INTO public."Merchants" (id, display_name, icon_url, funny_gif_url) VALUES %L', merchantsPrepared), []);
}

const deleteUser = async (client, userId) => {
    await client.query(format("DELETE FROM public.\"Users\" WHERE id = '%s'", userId), []);
}

const deleteMerchant = async (client, merchantId) => {
    await client.query(format("DELETE FROM public.\"Merchants\" WHERE id = '%s'", merchantId), []);
}

const deleteTransaction = async (client, transactionId) => {
    await client.query(format("DELETE FROM public.\"Transactions\" WHERE id = '%s'", transactionId), []);
}

module.exports = {
    insertUsers,
    insertMerchants,
    deleteUser,
    deleteMerchant,
    deleteTransaction
}

