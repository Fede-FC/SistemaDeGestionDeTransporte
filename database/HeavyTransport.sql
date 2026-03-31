-- ============================================================
-- HeavyTransport v2.1 - Correcciones aplicadas
--   1. DEFAULT de stateid resuelto con trigger (PostgreSQL
--      no permite subqueries en DEFAULT)
--   2. Constraint viaje-vehículo resuelto con trigger (PostgreSQL
--      no permite subqueries en CHECK)
--   3. Usuario local único para período de prueba
-- ============================================================

\c heavy_transport;

-- ============================================
-- System Users
-- ============================================
CREATE TABLE users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuario local único para período de prueba
INSERT INTO users (username, email, password_hash)
VALUES ('admin', 'admin@empresa.com', 'CAMBIAR_ESTE_HASH_ANTES_DE_USAR');

-- ============================================
-- Employees / Drivers
-- ============================================
CREATE TABLE employees (
    employeeid SERIAL PRIMARY KEY,
    id_number VARCHAR(20) UNIQUE NOT NULL,
    fullname VARCHAR(80) NOT NULL,
    hire_date DATE NOT NULL,
    termination_date DATE,
    active BOOLEAN DEFAULT TRUE,
    userid INT NOT NULL REFERENCES users(userid)
);

-- ============================================
-- Vehicles
-- ============================================
CREATE TABLE vehicles (
    vehicleid SERIAL PRIMARY KEY,
    plate VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(40) NOT NULL,
    model VARCHAR(40) NOT NULL,
    year INT CHECK (year >= 1980 AND year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    active BOOLEAN DEFAULT TRUE,
    userid INT NOT NULL REFERENCES users(userid)
);

-- ============================================
-- Clients
-- ============================================
CREATE TABLE clients (
    clientid SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    contact VARCHAR(100),
    userid INT NOT NULL REFERENCES users(userid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Trip States
-- ============================================
CREATE TABLE trip_states (
    stateid SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
);

INSERT INTO trip_states (name) VALUES
('Trip completed'),
('Pending billing'),
('Invoice sent'),
('Invoice accepted'),
('Invoice paid');

-- ============================================
-- Trips
-- stateid por defecto se asigna via trigger
-- ============================================
CREATE TABLE trips (
    tripid SERIAL PRIMARY KEY,
    trip_date DATE NOT NULL,
    vehicleid INT NOT NULL REFERENCES vehicles(vehicleid),
    driverid INT NOT NULL REFERENCES employees(employeeid),
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    clientid INT NOT NULL REFERENCES clients(clientid),
    payment_received NUMERIC(12,2) DEFAULT 0,
    container_number VARCHAR(30),
    invoice_number VARCHAR(30),
    description VARCHAR(200),
    stateid INT REFERENCES trip_states(stateid),
    billing_date TIMESTAMP,
    userid INT NOT NULL REFERENCES users(userid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MEJORA 1: Trigger que asigna 'Pending billing' por defecto
CREATE OR REPLACE FUNCTION set_default_trip_state()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stateid IS NULL THEN
        SELECT stateid INTO NEW.stateid
        FROM trip_states
        WHERE name = 'Pending billing';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_default_trip_state
BEFORE INSERT ON trips
FOR EACH ROW
EXECUTE FUNCTION set_default_trip_state();

-- ============================================
-- Expenses
-- ============================================
CREATE TABLE expenses (
    expenseid SERIAL PRIMARY KEY,
    expense_type VARCHAR(40) NOT NULL CHECK (
        expense_type IN ('Fuel','Tolls','Maintenance','Repairs','Other')
    ),
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    description VARCHAR(200),
    tripid INT REFERENCES trips(tripid),
    vehicleid INT REFERENCES vehicles(vehicleid),
    userid INT NOT NULL REFERENCES users(userid),
    expense_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MEJORA 2: Trigger que valida coherencia viaje-vehículo
CREATE OR REPLACE FUNCTION check_expense_trip_vehicle()
RETURNS TRIGGER AS $$
DECLARE
    trip_vehicle INT;
BEGIN
    IF NEW.tripid IS NOT NULL AND NEW.vehicleid IS NOT NULL THEN
        SELECT vehicleid INTO trip_vehicle
        FROM trips
        WHERE tripid = NEW.tripid;

        IF trip_vehicle <> NEW.vehicleid THEN
            RAISE EXCEPTION
                'El vehículo del gasto (%) no coincide con el vehículo del viaje (%)',
                NEW.vehicleid, trip_vehicle;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_expense_vehicle
BEFORE INSERT OR UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION check_expense_trip_vehicle();

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_trips_date       ON trips(trip_date);
CREATE INDEX idx_trips_client     ON trips(clientid);
CREATE INDEX idx_trips_driver     ON trips(driverid);
CREATE INDEX idx_expenses_trip    ON expenses(tripid);
CREATE INDEX idx_expenses_vehicle ON expenses(vehicleid);
