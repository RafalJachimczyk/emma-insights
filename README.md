

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
    "userId": "c36da3d0-6f40-4203-a4c7-9b6692f1bc28",
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

However, after an email exchange with Antonio I decided to go for another, sipler approach. Use the same database, but a new de-normalised table. 

Instead of using kafka streams to process the data that needs to be stored in Insights database, we'll use triggers that are executed when and INSERT query is performed on Transactions table. Trigger function would pick up a Transaction record and execute an UPSERT query on Insights table. 

The logic of that function is to add all transactions for a given:
- user_id
- merchant_id
- date

So that we end up with a daily amount spent by a given user at a given merchant. 

# Assumptions 
- We don't do massive data loads on the production database. The way the trigger is structured causes slower INSERTS on the Transaction table, as the trigger is executed on each INSERT. Instead the API might be using a read replica. 
- We do not need fine grained time/date periods. Calculation granularity is set to be a day (e.g. we can compare user insights for a given day, but we can't select a particular time periods within a day). It's probably fair to say that we (or our users) don't want to be comparing themselves to others every hour. Daily is good enough. 
- Insights Database stores daily amounts.
- Insights API can be asked for insights between days. 

# De-normalised table schemas

**The table schema for user based insights**


| Field name | Type | Example | Comments |
|------------|------|---------|----------|
| user_id | uuid | fd92fb65-cb63-41a0-a85d-116b83548d29|
| merchant_id | uuid | b62cfe89-4346-4e27-b303-6c5268e77c83|
| date | date | 2021-09-13 | We aggregate insights daily|
| user_merchant_spent_amount | big float | 11421.56 | Sum of all received transactions for a given user |
| percentile_spent | small float | 0.03 | Percentile of all transactions for given user and merchant vs global amount spent at this merchant |

# Postgres optimalizations #

# Further optimalizations possible #

- Calculate monthly totals
- Partition table by months


# Code structure & architcture

For the purpose of this demo/prototype phase I'm storing all the code in the "monorepo" structure. For the production ready system I would split apart all the microservices in separate repositories. 

I'll try to use hexagonal design as much as possible. Also starting with TDD. My first task is to work on the domain/business logic of the Insights Connector. That's the heart of the task and would like to get down to it first. 

Using jest as a testing framework, as it has all the features that I will need. And I like it more over Mocha+Chai. 

## Insights Connector



### TODO:
- Convert to typescript
- Add coverage report
- Add Linter / Prettier