CREATE TABLE IF NOT EXISTS public."InsightsDaily" (
	user_id uuid NOT NULL,
    merchant_id uuid NOT NULL,
	date date NOT NULL,
	amount money NOT NULL,	
	PRIMARY KEY(user_id, merchant_id, date)
);

ALTER TABLE IF EXISTS public."InsightsDaily"
	ADD CONSTRAINT transaction_merchant
	FOREIGN KEY (merchant_id)
	REFERENCES "Merchants" (id);

ALTER TABLE IF EXISTS public."InsightsDaily"
	ADD CONSTRAINT transaction_user
	FOREIGN KEY (user_id)
	REFERENCES "Users" (id);