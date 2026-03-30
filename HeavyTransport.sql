
CREATE DATABASE heavy_transport;
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

-- ============================================
-- Usuario local único para período de prueba
-- En producción este INSERT se elimina y se
-- gestiona desde el sistema de registro.
-- El userid resultante (probablemente 1) se
-- usa como OWNER_ID en el backend local.
-- ============================================
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
-- Trip States (for billing workflow)
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

    -- MEJORA 1: stateid por nombre para evitar dependencia del orden de inserción
    stateid INT REFERENCES trip_states(stateid)
        DEFAULT (SELECT stateid FROM trip_states WHERE name = 'Pending billing'),

    billing_date TIMESTAMP,
    userid INT NOT NULL REFERENCES users(userid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Expenses
-- MEJORA 2: Constraint de consistencia viaje-vehículo
--
-- Permite:
--   - Gasto sin viaje ni vehículo (ej: llantas de repuesto) ✓
--   - Gasto con solo vehículo (ej: mantenimiento general)   ✓
--   - Gasto con solo viaje                                  ✓
--   - Gasto con viaje + vehículo del mismo camión           ✓
--
-- Rechaza:
--   - Gasto con viaje de un camión y vehículo de otro       ✗
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Garantiza coherencia cuando se especifican ambos campos
    CONSTRAINT chk_trip_vehicle_match CHECK (
        tripid IS NULL
        OR vehicleid IS NULL
        OR vehicleid = (SELECT vehicleid FROM trips WHERE tripid = expenses.tripid)
    )
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_trips_date ON trips(trip_date);
CREATE INDEX idx_expenses_trip ON expenses(tripid);
CREATE INDEX idx_expenses_vehicle ON expenses(vehicleid);
CREATE INDEX idx_trips_client ON trips(clientid);
CREATE INDEX idx_trips_driver ON trips(driverid);
