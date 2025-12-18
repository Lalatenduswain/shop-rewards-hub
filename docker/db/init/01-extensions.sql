-- Initialize PostgreSQL extensions for ShopRewards Hub

-- pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PostGIS for location/geospatial features (optional)
-- Uncomment if you need geolocation features
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE shoprewards TO shoprewards;
