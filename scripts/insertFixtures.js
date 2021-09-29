const format = require('pg-format');

const insertUsers = async (client, usersPrepared) => {
    return await client.query(format('INSERT INTO public."Users" (id, first_name, last_name) VALUES %L', usersPrepared), []);
}

const insertMerchants = async (client, merchantsPrepared) => {
    return await client.query(format('INSERT INTO public."Merchants" (id, display_name, icon_url, funny_gif_url) VALUES %L', merchantsPrepared), []);
}

module.exports = {
    insertUsers,
    insertMerchants
}

