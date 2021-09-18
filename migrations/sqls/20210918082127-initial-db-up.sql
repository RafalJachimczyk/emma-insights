CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public."Merchants" (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	display_name character varying NOT NULL,
	icon_url character varying NOT NULL,
	funny_gif_url character varying NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS public."Users" (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	first_name character varying NOT NULL,
	last_name character varying NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS public."Transactions" (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	user_id uuid NOT NULL,
	date date NOT NULL,
	amount money NOT NULL,
	description character varying NOT NULL,
	merchant_id uuid NOT NULL,
	PRIMARY KEY(id)
);

ALTER TABLE IF EXISTS public."Transactions"
	ADD CONSTRAINT transaction_merchant
	FOREIGN KEY (merchant_id)
	REFERENCES "Merchants" (id);

ALTER TABLE IF EXISTS public."Transactions"
	ADD CONSTRAINT transaction_user
	FOREIGN KEY (user_id)
	REFERENCES "Users" (id);