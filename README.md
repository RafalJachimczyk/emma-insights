# TL;DR;

The below commands will initialise database, start the development version of server (a.k.a local) and run all suites of tests (unit, integration and e2e).

```
npm i
docker-compose up
npm run db:create
npm run db:up

npm run start:dev
npm run test
```

E2E tests are documenting the behaviour of the api, but in short what happens is :
- We generate and insert some users and merchants and store them in DB
- We use the Transactions API to insert transactions (DB triggers add Insights entries)
- We make requests to Insights API to see if the insights are correct and what we expect


# Background

Emma runs a single SQL database with the following tables:

```
Users (id, first_name, last_name)

Merchants (id, display_name, icon_url, funny_gif_url)

Transactions (id, user_id, date, amount, description, merchant_id)
```

Let's assume there is a REST API which accepts transactions:

```
POST /transactions

{
    "user_id": "c36da3d0-6f40-4203-a4c7-9b6692f1bc28",
    "merchant_id": "7ff2cf83-1972-437a-b6d5-a9f438a787e0",
    "date": "2011-10-05T14:48:00.000Z",
    "amount": 11.21,
    "description": "Venti Latte"
}
```

The API would be probably called by some machine process (e.g. aggregator), which aggregates transactions from various sources (Plaid, SaltEdge etc.) and sends requests to the API in question. The API then inserts the transactions into SQL database. 

# Proposal

~~The solution I'm proposing is based on Kafka message streaming~~. 

Retrieving/querying large amounts of data in a normalised and relational databases is very heavy on the database I/O. The plan is to denormalise the database for the purposes of the Insights API, so that we only query for the information that we need and nothing more. 

The initial proposal is to create a separate de-normalised table that stores insights. I was originally planning to build the service around kafka streams, where messages would be picked by a separate microservice and store the de-normalised data in separate database.

However, that design had flaws - namely - the microservice would have to query the db quite heavily over the network - that's bad for number of reasons. 

Instead of using kafka streams to process the data that needs to be stored in Insights database, we'll use triggers that are executed when and INSERT query is performed on Transactions table. Trigger function would pick up a Transaction record and execute an UPSERT query on Insights table. 

The logic of that function is to add all transactions for a given:
- user_id
- merchant_id
- date

So that we end up with a daily amount spent by a given user at a given merchant. 

Pre-computing daily amounts massively speeds up the percentile calculations, as will be shown in the **Playing with big data** section below. 

# Assumptions 
- We don't do massive data loads on the production database. The way the trigger is structured causes slower INSERTS on the Transaction table, as the trigger is executed on each INSERT. Instead the API might be using a read replica. 
- We do not need fine grained time/date periods. Calculation granularity is set to be a day (e.g. we can compare user insights for a given day, but we can't select a particular time periods within a day). It's probably fair to say that we (or our users) don't want to be comparing themselves to others every hour. Daily is good enough. 
- Insights Database stores daily amounts.
- Insights API can be asked for insights between days. 

# De-normalised table schema

**The table schema for user based insights**

| Field name | Type | Example | Comments |
|------------|------|---------|----------|
| user_id | uuid | fd92fb65-cb63-41a0-a85d-116b83548d29|
| merchant_id | uuid | b62cfe89-4346-4e27-b303-6c5268e77c83|
| date | date | 2021-09-13 | We aggregate insights daily|
| amount | number | 11421.56 | Sum of all received transactions for a given user, merchant and a day |


# Project setup

## Project layout

- `./migrations` - contains database initialisation scripts and SQL for db-migrate
- `./scripts` - fixture data generation scripts
- `./src/domain` - code containing business/domain logic
- `./src/adapters` - adapters to provide connectivity with databases etc.
- `./src/http` - http port with express handlers
- `./.env` - configuration values
- `./database.json` - `db-migrate` config
- `./docker-compose.yaml` - Docker compose setup with database and API service definitions
- `./jest.config.js` - Using jest for testing - here's it's config (i.e. automocks off)
- `./postgresql.config` - We're overriding some of the PostgreSQL default config values for better IO performance. Optimised for server with 16GB of ram like my machine. Fine tune if your's is different.

## Application initialisation

Below are the required steps to prepare the app to run and to be tested.

- `npm i` - installs node modules
- `docker-compose up` - Starts up the application (i.e. PostgresSQL database and the API)
- `npm run db:create` - Creates the database
- `npm run db:up` - Initialises the database with required schemas, triggers etc

All this would ensure the app is ready for further steps.

# Playing with big data

It's important to simulate the environment in which our Insights API will operate. In the discovery phase of the project we'll create a set of data that Emma operates on, in an SQL (presumeably relational) database. All this before we start writing any code - to ensure our assumptions are correct (specifically around app scalability)

For that we need:
- 1,000,000 Users
- 500,000 Merchants
- 1,000,000,000 Transactions

This repo contains a script generating the above and inserting it into our database. It's based on [mocker-data-generator](https://www.npmjs.com/package/mocker-data-generator) npm module. The only caveat is that it would take a vary long time to insert 1 billion of transactions into a database (especially on my 2012 MacBook Air) and it would also consime huge amount of disk space. So for the purpose of this exercise we're reducing amount of transactions to 10 milion. We should be able to make a reasonable good predictions using this amount - and see differences between optimised and unoptimised queries/tables. 

The script genrates realistic data for the `User` <-> `Transaction` <-> `Merchant` model, together with relations between these. It then inserts these into our DB. 

Note: When Transactions are INSERTed, the trigger function called `insert_daily_insight()` is executed. 

You can polulate the DB with fixture data by running
```
npm run generate:fixtures
``` 
It will take a while. On my Mac it took 2 hours to populate 10 milion entries. You can change the number of records to insert by amending the 
```
await insertTransactions(1000, 100000, users, merchants, bar);
```
line in `runInsertTransactions.js` file. 

Once you're done we can take a look at the below queries:

```
SELECT * FROM public."InsightsDaily" ORDER BY date DESC LIMIT 10;
```

Here's the result of a query on our pre-aggregated InsightsDaily table. Take a note of one of the UUIDs for a user, and then run the below queries: 

```
SELECT *
FROM (
    SELECT
        SUM(t.amount) total_amount,
        PERCENT_RANK() over (
            PARTITION BY t.merchant_id
            ORDER BY SUM(t.amount)
        ) percentile_rank,
        t.user_id,
        t.merchant_id,
        t.date
    FROM public."Transactions" t
    WHERE t.date = '2021-09-29'
    GROUP BY t.user_id, t.merchant_id, t.date
    ORDER BY percentile_rank DESC
) as all_ranks
WHERE all_ranks.user_id = 'edd6f248-c155-55a9-bdb9-4c7b5dbf4665';
```

```
SELECT *
FROM (
    SELECT
        SUM(i.amount) total_amount,
        PERCENT_RANK() over (
            PARTITION BY i.merchant_id
            ORDER BY SUM(i.amount)
        ) percentile_rank,
        i.user_id,
        i.merchant_id,
        i.date
    FROM public."InsightsDaily" i
    WHERE i.date = '2021-09-29'
    GROUP BY i.user_id, i.merchant_id, i.date
    ORDER BY percentile_rank DESC
) as all_ranks
WHERE user_id = 'edd6f248-c155-55a9-bdb9-4c7b5dbf4665';
```

Take a note on the response time from postgres for each of the queries. In my case (10 milion records) the first query responds in ~800 ms. The second one, based on pre-aggregated daily amounts responds in ~70 ms. That's an order of magnitude better - pretty good!

# Further optimalizations possible

- Add additional index on InsightsDaily
- Calculate monthly totals
- Partition table by months
- Move Insights table to a separate database and use kafka streams to make copy of incoming transactions. We could still use triggers to generate Insights, but this way, the Transactions DB will not be hammered by the triggers. And everyone would be happy 💆‍♀️.

# Code structure & architcture

I'll try to use hexagonal design (ports&adapters) as much as possible. Also starting with TDD. 

The Insights API will contain the below layers
- HTTP - to serve the requests
- Postgres Client - to establish DB connection

Since most of the hard work would be done by the Database and triggers the code will be really simple and contain almost no business logic. 

The Insights API will intentionally only return essential data, and the Db layer code will not perform ANY Joins. It will be down to client to obtain User and Merchant data from the respective APIs (out of scope for this exercise).

Using jest as a testing framework, as it has all the features that I will need. And I like it more over Mocha+Chai. 

# Development + Testing

Before running tests make sure you followed steps in the **Application initialisation** section.

To run all tests fire away the below:
```
npm run test
```

This will run e2e, integration and unit tests. If you have not started the app yet, the e2e tests will fail.

To start the API server run:
```
npm run start:dev
```

# What could be improved:
- More E2E test cases
- Better error handling
- Better typescript coverage
- And a lot more things. But this never meant to be a production ready system :-)