ALTER TABLE ofsted_ratings
    ADD COLUMN IF NOT EXISTS quality_of_education      VARCHAR(50),
    ADD COLUMN IF NOT EXISTS behaviour_and_attitudes   VARCHAR(50),
    ADD COLUMN IF NOT EXISTS personal_development      VARCHAR(50),
    ADD COLUMN IF NOT EXISTS leadership_and_management VARCHAR(50);
