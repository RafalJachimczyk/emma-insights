CREATE OR REPLACE FUNCTION insert_daily_insight()
   RETURNS TRIGGER 
   LANGUAGE PLPGSQL
AS 
$$
BEGIN
    INSERT INTO public."InsightsDaily" as i (user_id, merchant_id, date, amount)
	VALUES(NEW.user_id, NEW.merchant_id, NEW.date, NEW.amount)
    ON CONFLICT (user_id, merchant_id, date) DO UPDATE
    SET amount = i.amount + NEW.amount;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_daily_insights 
    AFTER INSERT ON public."Transactions"
    FOR EACH ROW
    EXECUTE PROCEDURE insert_daily_insight();