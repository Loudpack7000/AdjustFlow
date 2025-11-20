-- Initial database setup for AdjustFlow
-- This file is automatically executed when the PostgreSQL container starts

-- Create the main database (already created by POSTGRES_DB env var)
-- But we can add any initial setup here

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create a simple test table to verify the database is working
CREATE TABLE IF NOT EXISTS test_connection (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message TEXT DEFAULT 'Database connection successful'
);

-- Insert a test record
INSERT INTO test_connection (message) VALUES ('AdjustFlow database initialized successfully');

