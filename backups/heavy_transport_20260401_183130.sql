--
-- PostgreSQL database dump
--

\restrict y4yvqQsVoc9YT6e5X5Yl6QH2QumNuvdT7pjaQGwA531lIte1XWetPJ6vgKTqb6A

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: check_expense_trip_vehicle(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_expense_trip_vehicle() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.check_expense_trip_vehicle() OWNER TO postgres;

--
-- Name: set_default_trip_state(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_default_trip_state() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.stateid IS NULL THEN
        SELECT stateid INTO NEW.stateid
        FROM trip_states
        WHERE name = 'Pending billing';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_default_trip_state() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    clientid integer NOT NULL,
    name character varying(80) NOT NULL,
    contact character varying(100),
    userid integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    active boolean DEFAULT true
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: clients_clientid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clients_clientid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_clientid_seq OWNER TO postgres;

--
-- Name: clients_clientid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clients_clientid_seq OWNED BY public.clients.clientid;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    employeeid integer NOT NULL,
    id_number character varying(20) NOT NULL,
    fullname character varying(80) NOT NULL,
    hire_date date NOT NULL,
    termination_date date,
    active boolean DEFAULT true,
    userid integer NOT NULL
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_employeeid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_employeeid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_employeeid_seq OWNER TO postgres;

--
-- Name: employees_employeeid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_employeeid_seq OWNED BY public.employees.employeeid;


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    expenseid integer NOT NULL,
    expense_type character varying(40) NOT NULL,
    amount numeric(12,2) NOT NULL,
    description character varying(200),
    tripid integer,
    vehicleid integer,
    userid integer NOT NULL,
    expense_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT expenses_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT expenses_expense_type_check CHECK (((expense_type)::text = ANY ((ARRAY['Fuel'::character varying, 'Tolls'::character varying, 'Maintenance'::character varying, 'Repairs'::character varying, 'Other'::character varying])::text[])))
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: expenses_expenseid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expenses_expenseid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenses_expenseid_seq OWNER TO postgres;

--
-- Name: expenses_expenseid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_expenseid_seq OWNED BY public.expenses.expenseid;


--
-- Name: trip_states; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_states (
    stateid integer NOT NULL,
    name character varying(30) NOT NULL
);


ALTER TABLE public.trip_states OWNER TO postgres;

--
-- Name: trip_states_stateid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trip_states_stateid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_states_stateid_seq OWNER TO postgres;

--
-- Name: trip_states_stateid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trip_states_stateid_seq OWNED BY public.trip_states.stateid;


--
-- Name: trips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trips (
    tripid integer NOT NULL,
    trip_date date NOT NULL,
    vehicleid integer NOT NULL,
    driverid integer NOT NULL,
    origin character varying(100) NOT NULL,
    destination character varying(100) NOT NULL,
    clientid integer NOT NULL,
    payment_received numeric(12,2) DEFAULT 0,
    container_number character varying(30),
    invoice_number character varying(30),
    description character varying(200),
    stateid integer,
    billing_date timestamp without time zone,
    userid integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    dua_number character varying(30),
    equipment_size character varying(20),
    weight numeric(10,2),
    operation_type character varying(20),
    CONSTRAINT trips_operation_type_check CHECK (((operation_type)::text = ANY ((ARRAY['Import'::character varying, 'Export'::character varying, 'National'::character varying])::text[])))
);


ALTER TABLE public.trips OWNER TO postgres;

--
-- Name: trips_tripid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trips_tripid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trips_tripid_seq OWNER TO postgres;

--
-- Name: trips_tripid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trips_tripid_seq OWNED BY public.trips.tripid;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    userid integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(200) NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_userid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_userid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_userid_seq OWNER TO postgres;

--
-- Name: users_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_userid_seq OWNED BY public.users.userid;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    vehicleid integer NOT NULL,
    plate character varying(20) NOT NULL,
    brand character varying(40) NOT NULL,
    model character varying(40) NOT NULL,
    year integer,
    active boolean DEFAULT true,
    userid integer NOT NULL,
    CONSTRAINT vehicles_year_check CHECK (((year >= 1980) AND ((year)::numeric <= EXTRACT(year FROM CURRENT_DATE))))
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- Name: vehicles_vehicleid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicles_vehicleid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicles_vehicleid_seq OWNER TO postgres;

--
-- Name: vehicles_vehicleid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicles_vehicleid_seq OWNED BY public.vehicles.vehicleid;


--
-- Name: clients clientid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients ALTER COLUMN clientid SET DEFAULT nextval('public.clients_clientid_seq'::regclass);


--
-- Name: employees employeeid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN employeeid SET DEFAULT nextval('public.employees_employeeid_seq'::regclass);


--
-- Name: expenses expenseid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN expenseid SET DEFAULT nextval('public.expenses_expenseid_seq'::regclass);


--
-- Name: trip_states stateid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_states ALTER COLUMN stateid SET DEFAULT nextval('public.trip_states_stateid_seq'::regclass);


--
-- Name: trips tripid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips ALTER COLUMN tripid SET DEFAULT nextval('public.trips_tripid_seq'::regclass);


--
-- Name: users userid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN userid SET DEFAULT nextval('public.users_userid_seq'::regclass);


--
-- Name: vehicles vehicleid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN vehicleid SET DEFAULT nextval('public.vehicles_vehicleid_seq'::regclass);


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (clientid, name, contact, userid, created_at, updated_at, active) FROM stdin;
2	Fede1	Fede1	1	2026-04-01 00:06:26.233991	2026-04-01 00:06:26.233991	t
1	Fede	Fede	1	2026-03-31 01:34:47.425855	2026-04-02 00:27:53.482735	f
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (employeeid, id_number, fullname, hire_date, termination_date, active, userid) FROM stdin;
1	101110111	Juan Pérez	2024-01-15	\N	t	1
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (expenseid, expense_type, amount, description, tripid, vehicleid, userid, expense_date, created_at, updated_at) FROM stdin;
1	Tolls	2000.00	\N	1	1	1	2026-03-31 00:00:00	2026-04-01 00:37:52.572304	2026-04-01 00:37:52.572304
\.


--
-- Data for Name: trip_states; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trip_states (stateid, name) FROM stdin;
1	Trip completed
2	Pending billing
3	Invoice sent
4	Invoice accepted
5	Invoice paid
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trips (tripid, trip_date, vehicleid, driverid, origin, destination, clientid, payment_received, container_number, invoice_number, description, stateid, billing_date, userid, created_at, updated_at, dua_number, equipment_size, weight, operation_type) FROM stdin;
2	2026-03-30	1	1	c	b	2	12.00	12	123	123	2	\N	1	2026-04-01 00:27:09.332912	2026-04-01 00:27:09.332912	12	20ft	1222.00	Import
1	2026-03-31	1	1	a	b	2	12122.00	123	fede	mondongo 	4	\N	1	2026-04-01 00:07:15.634233	2026-04-01 06:06:18.763817	123	20ft	1222.00	National
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (userid, username, email, password_hash, active, created_at, updated_at) FROM stdin;
1	admin	admin@empresa.com	$2b$10$H3bP9lWs3.XLtJDPs/1C1.OoF5l4x/aAUuEtnBygAEJ3NUz98j5Ea	t	2026-03-30 05:22:48.827094	2026-03-30 05:22:48.827094
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicles (vehicleid, plate, brand, model, year, active, userid) FROM stdin;
1	ABC123	Kenworth	T680	2020	t	1
\.


--
-- Name: clients_clientid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_clientid_seq', 2, true);


--
-- Name: employees_employeeid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_employeeid_seq', 1, true);


--
-- Name: expenses_expenseid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_expenseid_seq', 1, true);


--
-- Name: trip_states_stateid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trip_states_stateid_seq', 5, true);


--
-- Name: trips_tripid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trips_tripid_seq', 2, true);


--
-- Name: users_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_userid_seq', 1, true);


--
-- Name: vehicles_vehicleid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicles_vehicleid_seq', 1, true);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (clientid);


--
-- Name: employees employees_id_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_id_number_key UNIQUE (id_number);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (employeeid);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (expenseid);


--
-- Name: trip_states trip_states_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_states
    ADD CONSTRAINT trip_states_name_key UNIQUE (name);


--
-- Name: trip_states trip_states_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_states
    ADD CONSTRAINT trip_states_pkey PRIMARY KEY (stateid);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (tripid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (vehicleid);


--
-- Name: vehicles vehicles_plate_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_plate_key UNIQUE (plate);


--
-- Name: idx_expenses_trip; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_trip ON public.expenses USING btree (tripid);


--
-- Name: idx_expenses_vehicle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_vehicle ON public.expenses USING btree (vehicleid);


--
-- Name: idx_trips_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_client ON public.trips USING btree (clientid);


--
-- Name: idx_trips_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_date ON public.trips USING btree (trip_date);


--
-- Name: idx_trips_driver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_driver ON public.trips USING btree (driverid);


--
-- Name: expenses trg_check_expense_vehicle; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_check_expense_vehicle BEFORE INSERT OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.check_expense_trip_vehicle();


--
-- Name: trips trg_default_trip_state; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_default_trip_state BEFORE INSERT ON public.trips FOR EACH ROW EXECUTE FUNCTION public.set_default_trip_state();


--
-- Name: clients clients_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid);


--
-- Name: employees employees_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid);


--
-- Name: expenses expenses_tripid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_tripid_fkey FOREIGN KEY (tripid) REFERENCES public.trips(tripid);


--
-- Name: expenses expenses_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid);


--
-- Name: expenses expenses_vehicleid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_vehicleid_fkey FOREIGN KEY (vehicleid) REFERENCES public.vehicles(vehicleid);


--
-- Name: trips trips_clientid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_clientid_fkey FOREIGN KEY (clientid) REFERENCES public.clients(clientid);


--
-- Name: trips trips_driverid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_driverid_fkey FOREIGN KEY (driverid) REFERENCES public.employees(employeeid);


--
-- Name: trips trips_stateid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_stateid_fkey FOREIGN KEY (stateid) REFERENCES public.trip_states(stateid);


--
-- Name: trips trips_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid);


--
-- Name: trips trips_vehicleid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_vehicleid_fkey FOREIGN KEY (vehicleid) REFERENCES public.vehicles(vehicleid);


--
-- Name: vehicles vehicles_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid);


--
-- PostgreSQL database dump complete
--

\unrestrict y4yvqQsVoc9YT6e5X5Yl6QH2QumNuvdT7pjaQGwA531lIte1XWetPJ6vgKTqb6A

