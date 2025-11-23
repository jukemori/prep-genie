-- Add locale preferences to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN locale TEXT CHECK (locale IN ('en', 'ja')) DEFAULT 'en',
ADD COLUMN unit_system TEXT CHECK (unit_system IN ('metric', 'imperial')) DEFAULT 'metric',
ADD COLUMN currency TEXT CHECK (currency IN ('USD', 'JPY')) DEFAULT 'USD';

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.locale IS 'User preferred language (en=English, ja=Japanese)';
COMMENT ON COLUMN user_profiles.unit_system IS 'Preferred unit system (metric=kg/cm, imperial=lb/ft)';
COMMENT ON COLUMN user_profiles.currency IS 'Preferred currency for cost displays';
