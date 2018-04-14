-- Author: Chris Buonocore
-- Routable SQL schema setup code.

--DROP DATABASE IF EXISTS routable;
CREATE DATABASE routable;
\c routable;

CREATE TABLE port (
  ID SERIAL PRIMARY KEY,
  name VARCHAR(64) UNIQUE,
  lat float(7),
  lng float(7)
);

CREATE TABLE job (
  pickupId  SERIAL REFERENCES port(ID),
  deliveryId SERIAL REFERENCES port(ID),
  jobDate date,
  PRIMARY KEY (pickupId, deliveryId, jobDate)
);

--CREATE TABLE driver (
--  ID SERIAL PRIMARY KEY,
--  name VARCHAR(64)
--);

