-- Author: Chris Buonocore
-- Routable SQL schema setup code

-- DROP DATABASE IF EXISTS routable;
CREATE DATABASE routable;
\c routable;

CREATE TABLE port (
  ID SERIAL PRIMARY KEY,
  name VARCHAR(64) DISTINCT,
  lat float(7),
  lng float(7),
);

CREATE TABLE driver (
  ID SERIAL PRIMARY KEY,
  name VARCHAR
)

CREATE TABLE job (
  pickupId  SERIAL REFERENCES port(ID),
  deliveryId SERIAL REFERENCES port(ID)
  jobDate date,
)
