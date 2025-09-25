--
-- PostgreSQL database dump
--

\restrict IPFYKMQd7DfshaffuDrjim0R4sOZ4gIwJeRib2iJQp9bklkAdYjweMS55LRmF3Y

-- Dumped from database version 17.5 (1b53132)
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: chat_status_enum; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.chat_status_enum AS ENUM (
    'active',
    'deactive',
    'blocked',
    'flagged'
);


ALTER TYPE public.chat_status_enum OWNER TO neondb_owner;

--
-- Name: feedback_type_enum; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.feedback_type_enum AS ENUM (
    'platform',
    'course',
    'service',
    'neutral',
    'positive',
    'negative'
);


ALTER TYPE public.feedback_type_enum OWNER TO neondb_owner;

--
-- Name: order_assignment_status_enum; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.order_assignment_status_enum AS ENUM (
    'assigned',
    'in_progress',
    'completed'
);


ALTER TYPE public.order_assignment_status_enum OWNER TO neondb_owner;

--
-- Name: project_status_enum; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.project_status_enum AS ENUM (
    'available',
    'taken',
    'done',
    'waiting',
    'pending'
);


ALTER TYPE public.project_status_enum OWNER TO neondb_owner;

--
-- Name: subscription_status_enum; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.subscription_status_enum AS ENUM (
    'active',
    'expired'
);


ALTER TYPE public.subscription_status_enum OWNER TO neondb_owner;

--
-- Name: user_type_enum; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.user_type_enum AS ENUM (
    'Jordanian',
    'Non-Jordanian'
);


ALTER TYPE public.user_type_enum OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    freelancer_id integer NOT NULL,
    appointment_date timestamp without time zone NOT NULL,
    message text,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    appointment_type character varying(20) DEFAULT 'online'::character varying NOT NULL
);


ALTER TABLE public.appointments OWNER TO neondb_owner;

--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO neondb_owner;

--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.attachments (
    id integer NOT NULL,
    order_id integer NOT NULL,
    file_url character varying NOT NULL
);


ALTER TABLE public.attachments OWNER TO neondb_owner;

--
-- Name: attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attachments_id_seq OWNER TO neondb_owner;

--
-- Name: attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.attachments_id_seq OWNED BY public.attachments.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    owner_id integer NOT NULL,
    freelancer_id integer NOT NULL,
    order_assignments_id integer,
    status public.chat_status_enum DEFAULT 'active'::public.chat_status_enum
);


ALTER TABLE public.conversations OWNER TO neondb_owner;

--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversations_id_seq OWNER TO neondb_owner;

--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: course_enrollments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.course_enrollments (
    id integer NOT NULL,
    course_id integer NOT NULL,
    freelancer_id integer NOT NULL,
    enrolled_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    progress numeric(5,2) DEFAULT 0.00
);


ALTER TABLE public.course_enrollments OWNER TO neondb_owner;

--
-- Name: course_enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.course_enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_enrollments_id_seq OWNER TO neondb_owner;

--
-- Name: course_enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.course_enrollments_id_seq OWNED BY public.course_enrollments.id;


--
-- Name: course_materials; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.course_materials (
    id integer NOT NULL,
    course_id integer NOT NULL,
    file_url character varying NOT NULL
);


ALTER TABLE public.course_materials OWNER TO neondb_owner;

--
-- Name: course_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.course_materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_materials_id_seq OWNER TO neondb_owner;

--
-- Name: course_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.course_materials_id_seq OWNED BY public.course_materials.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    title character varying NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    title_ar character varying,
    description_ar text,
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.courses OWNER TO neondb_owner;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO neondb_owner;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: customer_verifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customer_verifications (
    id integer NOT NULL,
    user_id integer,
    full_name character varying(200) NOT NULL,
    country character varying(100) NOT NULL,
    phone_number character varying(50) NOT NULL,
    document_type character varying(50),
    document_number character varying(100),
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    reviewed_at timestamp without time zone
);


ALTER TABLE public.customer_verifications OWNER TO neondb_owner;

--
-- Name: customer_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.customer_verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_verifications_id_seq OWNER TO neondb_owner;

--
-- Name: customer_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.customer_verifications_id_seq OWNED BY public.customer_verifications.id;


--
-- Name: feedbacks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.feedbacks (
    id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    freelancer_id integer NOT NULL,
    type public.feedback_type_enum DEFAULT 'platform'::public.feedback_type_enum NOT NULL
);


ALTER TABLE public.feedbacks OWNER TO neondb_owner;

--
-- Name: feedbacks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.feedbacks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feedbacks_id_seq OWNER TO neondb_owner;

--
-- Name: feedbacks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.feedbacks_id_seq OWNED BY public.feedbacks.id;


--
-- Name: freelancer_verification_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.freelancer_verification_categories (
    id integer NOT NULL,
    user_id integer NOT NULL,
    category_id integer NOT NULL
);


ALTER TABLE public.freelancer_verification_categories OWNER TO neondb_owner;

--
-- Name: freelancer_verification_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.freelancer_verification_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.freelancer_verification_categories_id_seq OWNER TO neondb_owner;

--
-- Name: freelancer_verification_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.freelancer_verification_categories_id_seq OWNED BY public.freelancer_verification_categories.id;


--
-- Name: freelancer_verifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.freelancer_verifications (
    id integer NOT NULL,
    user_id integer,
    full_name character varying(200) NOT NULL,
    country character varying(100) NOT NULL,
    phone_number character varying(50) NOT NULL,
    bio text,
    skills text,
    portfolio_url text,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    reviewed_at timestamp without time zone
);


ALTER TABLE public.freelancer_verifications OWNER TO neondb_owner;

--
-- Name: freelancer_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.freelancer_verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.freelancer_verifications_id_seq OWNER TO neondb_owner;

--
-- Name: freelancer_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.freelancer_verifications_id_seq OWNED BY public.freelancer_verifications.id;


--
-- Name: ip_adress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ip_adress (
    id integer NOT NULL,
    user_id integer NOT NULL,
    ip_address character varying NOT NULL,
    login_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ip_adress OWNER TO neondb_owner;

--
-- Name: logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    action text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.logs OWNER TO neondb_owner;

--
-- Name: logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logs_id_seq OWNER TO neondb_owner;

--
-- Name: logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.logs_id_seq OWNED BY public.logs.id;


--
-- Name: message_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.message_logs (
    id integer NOT NULL,
    message_id bigint NOT NULL,
    sender_id bigint NOT NULL,
    receiver_id bigint NOT NULL,
    logged_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    conversation_id bigint NOT NULL
);


ALTER TABLE public.message_logs OWNER TO neondb_owner;

--
-- Name: message_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.message_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.message_logs_id_seq OWNER TO neondb_owner;

--
-- Name: message_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.message_logs_id_seq OWNED BY public.message_logs.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    text text NOT NULL,
    time_sent timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image_url text
);


ALTER TABLE public.messages OWNER TO neondb_owner;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO neondb_owner;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    message text NOT NULL,
    read_status boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO neondb_owner;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    payer_id integer NOT NULL,
    receiver_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    order_id integer,
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.payments OWNER TO neondb_owner;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO neondb_owner;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    permission character varying(255) NOT NULL
);


ALTER TABLE public.permissions OWNER TO neondb_owner;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO neondb_owner;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: plans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.plans (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    duration integer NOT NULL,
    description text,
    features text[]
);


ALTER TABLE public.plans OWNER TO neondb_owner;

--
-- Name: plans_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plans_id_seq OWNER TO neondb_owner;

--
-- Name: plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.plans_id_seq OWNED BY public.plans.id;


--
-- Name: portfolios; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.portfolios (
    id integer NOT NULL,
    freelancer_id integer NOT NULL,
    title character varying NOT NULL,
    description text,
    hourly_rate numeric(10,2) NOT NULL,
    work_url character varying,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    skills text[],
    edit_at timestamp without time zone
);


ALTER TABLE public.portfolios OWNER TO neondb_owner;

--
-- Name: portfolios_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.portfolios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.portfolios_id_seq OWNER TO neondb_owner;

--
-- Name: portfolios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.portfolios_id_seq OWNED BY public.portfolios.id;


--
-- Name: project_assignments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.project_assignments (
    id integer NOT NULL,
    project_id integer NOT NULL,
    freelancer_id integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying DEFAULT 'active'::character varying
);


ALTER TABLE public.project_assignments OWNER TO neondb_owner;

--
-- Name: project_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.project_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_assignments_id_seq OWNER TO neondb_owner;

--
-- Name: project_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.project_assignments_id_seq OWNED BY public.project_assignments.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    user_id integer NOT NULL,
    category_id integer NOT NULL,
    sub_category_id integer,
    title character varying NOT NULL,
    description text NOT NULL,
    budget_min numeric NOT NULL,
    budget_max numeric NOT NULL,
    duration character varying,
    location character varying DEFAULT ''::character varying,
    status character varying DEFAULT ''::character varying,
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    assigned_freelancer_id integer
);


ALTER TABLE public.projects OWNER TO neondb_owner;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO neondb_owner;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: receipts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.receipts (
    id integer NOT NULL,
    payment_id integer NOT NULL,
    receipt_url character varying NOT NULL
);


ALTER TABLE public.receipts OWNER TO neondb_owner;

--
-- Name: receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.receipts_id_seq OWNER TO neondb_owner;

--
-- Name: receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.receipts_id_seq OWNED BY public.receipts.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    order_id integer NOT NULL,
    client_id integer NOT NULL,
    freelancer_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO neondb_owner;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO neondb_owner;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: role_permission; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.role_permission (
    id integer NOT NULL,
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.role_permission OWNER TO neondb_owner;

--
-- Name: role_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.role_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_permission_id_seq OWNER TO neondb_owner;

--
-- Name: role_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.role_permission_id_seq OWNED BY public.role_permission.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    role character varying(255) NOT NULL
);


ALTER TABLE public.roles OWNER TO neondb_owner;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO neondb_owner;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: sub_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sub_categories (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sub_categories OWNER TO neondb_owner;

--
-- Name: sub_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sub_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sub_categories_id_seq OWNER TO neondb_owner;

--
-- Name: sub_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sub_categories_id_seq OWNED BY public.sub_categories.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subscriptions (
    id integer NOT NULL,
    freelancer_id integer NOT NULL,
    plan_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status public.subscription_status_enum NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO neondb_owner;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscriptions_id_seq OWNER TO neondb_owner;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: user_logins_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_logins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_logins_id_seq OWNER TO neondb_owner;

--
-- Name: user_logins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_logins_id_seq OWNED BY public.ip_adress.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    role_id integer,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    is_deleted boolean DEFAULT false,
    phone_number character varying NOT NULL,
    country character varying NOT NULL,
    profile_pic_url character varying,
    username character varying NOT NULL,
    reason_for_disruption character varying DEFAULT NULL::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_online boolean DEFAULT false,
    socket_id text,
    violation_count integer DEFAULT 0 NOT NULL,
    rating numeric(2,1) DEFAULT 0,
    rating_sum numeric(10,2) DEFAULT 0,
    rating_count integer DEFAULT 0,
    category_id integer
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: attachments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attachments ALTER COLUMN id SET DEFAULT nextval('public.attachments_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: course_enrollments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.course_enrollments ALTER COLUMN id SET DEFAULT nextval('public.course_enrollments_id_seq'::regclass);


--
-- Name: course_materials id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.course_materials ALTER COLUMN id SET DEFAULT nextval('public.course_materials_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: customer_verifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_verifications ALTER COLUMN id SET DEFAULT nextval('public.customer_verifications_id_seq'::regclass);


--
-- Name: feedbacks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedbacks ALTER COLUMN id SET DEFAULT nextval('public.feedbacks_id_seq'::regclass);


--
-- Name: freelancer_verification_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.freelancer_verification_categories ALTER COLUMN id SET DEFAULT nextval('public.freelancer_verification_categories_id_seq'::regclass);


--
-- Name: freelancer_verifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.freelancer_verifications ALTER COLUMN id SET DEFAULT nextval('public.freelancer_verifications_id_seq'::regclass);


--
-- Name: ip_adress id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ip_adress ALTER COLUMN id SET DEFAULT nextval('public.user_logins_id_seq'::regclass);


--
-- Name: logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.logs ALTER COLUMN id SET DEFAULT nextval('public.logs_id_seq'::regclass);


--
-- Name: message_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.message_logs ALTER COLUMN id SET DEFAULT nextval('public.message_logs_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: plans id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.plans ALTER COLUMN id SET DEFAULT nextval('public.plans_id_seq'::regclass);


--
-- Name: portfolios id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.portfolios ALTER COLUMN id SET DEFAULT nextval('public.portfolios_id_seq'::regclass);


--
-- Name: project_assignments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.project_assignments ALTER COLUMN id SET DEFAULT nextval('public.project_assignments_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: receipts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.receipts ALTER COLUMN id SET DEFAULT nextval('public.receipts_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: role_permission id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permission ALTER COLUMN id SET DEFAULT nextval('public.role_permission_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: sub_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sub_categories ALTER COLUMN id SET DEFAULT nextval('public.sub_categories_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.appointments (id, freelancer_id, appointment_date, message, status, created_at, appointment_type) FROM stdin;
3	11	2025-09-01 15:00:00	Please call me via Zoom.	pending	2025-08-25 12:27:22.697173	online
4	11	2025-09-12 15:30:00	Please call me via Zoom.	accepted	2025-08-25 12:28:09.130017	online
5	11	2025-09-01 15:00:00	ggg	pending	2025-08-25 13:20:22.120024	online
2	11	2025-09-01 15:00:00	Please call me via Zoom.	pending	2025-08-25 12:27:17.351	online
1	11	2025-09-01 10:00:00	Looking forward to this appointment	pending	2025-08-25 12:23:52.719	online
\.


--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.attachments (id, order_id, file_url) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories (id, name, description) FROM stdin;
1	Web Development	All courses and projects related to web development.
2	Programming	Software Developer, Data Analyst, Network Engineer
3	Admin + Project Management	Administrative Assistant, Project Manager, and Process Analyst
4	Graphic Design	Graphic design is the art of visual communication that combines images, typography, and creativity to deliver impactful messages.
5	Content Creator	A content writer creates clear, engaging, and informative text tailored to attract and inform a specific audience.
6	Photographer	Photography is the art of capturing moments, emotions, and stories through the lens to create lasting visual impressions.
7	Music & Audio	Sound Engineer, Music Producer, Audio Editor
8	Remote Work	Customer Service Representative, Financial Analyst
9	Programming	Software development and engineering
10	Design	Graphic and UI/UX design
11	Marketing	Digital marketing and SEO
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.conversations (id, owner_id, freelancer_id, order_assignments_id, status) FROM stdin;
9	4	11	1	active
10	4	11	1	active
11	4	11	1	active
\.


--
-- Data for Name: course_enrollments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.course_enrollments (id, course_id, freelancer_id, enrolled_at, progress) FROM stdin;
2	1	11	2025-08-25 09:33:32.810415	0.00
\.


--
-- Data for Name: course_materials; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.course_materials (id, course_id, file_url) FROM stdin;
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.courses (id, title, description, price, title_ar, description_ar, is_deleted, created_at) FROM stdin;
1	ggg	gg	44.00	\N	\N	f	2025-08-26 10:07:54.256285
6	Complete JavaScript Mastery	Learn JavaScript from zero to advanced level with practical projects and exercises.	150.00	أكمل إتقان JavaScript	تعلم JavaScript من الصفر إلى المستوى المتقدم مع المشاريع العملية والتمارين.	f	2025-08-26 10:07:54.256285
\.


--
-- Data for Name: customer_verifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customer_verifications (id, user_id, full_name, country, phone_number, document_type, document_number, status, reviewed_at) FROM stdin;
\.


--
-- Data for Name: feedbacks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.feedbacks (id, user_id, content, created_at, freelancer_id, type) FROM stdin;
1	11	Amazing !	2025-08-25 11:02:05.970704	4	positive
2	11	Amazing !	2025-08-25 11:09:03.608943	4	positive
\.


--
-- Data for Name: freelancer_verification_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.freelancer_verification_categories (id, user_id, category_id) FROM stdin;
\.


--
-- Data for Name: freelancer_verifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.freelancer_verifications (id, user_id, full_name, country, phone_number, bio, skills, portfolio_url, status, reviewed_at) FROM stdin;
\.


--
-- Data for Name: ip_adress; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ip_adress (id, user_id, ip_address, login_time) FROM stdin;
1	4	127.0.0.1	2025-08-25 07:00:50.317698
2	4	187.54.45.1	2025-08-25 07:01:22.798484
3	4	127.0.0.1	2025-08-25 07:09:42.46598
4	4	127.25.14.5	2025-08-25 07:13:00.362397
5	4	127.25.14.5	2025-08-25 07:18:39.657674
6	4	127.0.0.1	2025-08-26 06:39:33.817571
7	4	127.0.0.1	2025-08-26 07:41:39.947634
8	4	127.25.14.5	2025-08-26 09:39:44.583539
9	4	127.25.14.5	2025-08-26 09:45:25.666195
10	4	127.25.14.5	2025-08-26 09:45:40.263766
11	4	127.25.14.5	2025-08-26 09:46:49.069284
12	4	127.0.0.1	2025-08-26 12:05:18.208555
13	20	127.0.0.1	2025-08-27 07:23:23.525825
14	20	127.0.0.1	2025-08-27 07:23:40.754791
15	20	127.0.0.1	2025-08-27 07:58:57.218842
16	20	127.0.0.1	2025-08-27 08:00:18.780671
17	20	127.0.0.1	2025-08-27 08:18:46.70494
18	20	127.0.0.1	2025-08-27 08:19:00.99175
19	20	127.0.0.1	2025-08-27 08:20:37.335834
20	29	127.0.0.1	2025-08-27 09:53:08.41594
21	29	127.0.0.1	2025-08-27 09:54:32.100396
22	29	127.0.0.1	2025-08-27 09:55:20.264388
23	30	127.0.0.1	2025-08-27 09:55:59.262767
24	30	127.0.0.1	2025-08-27 09:56:48.769444
25	30	127.0.0.1	2025-08-27 09:57:21.991855
26	30	127.0.0.1	2025-08-27 09:57:23.208008
27	30	127.0.0.1	2025-08-27 09:58:31.686405
28	30	127.0.0.1	2025-08-27 10:22:37.230148
29	30	127.0.0.1	2025-08-27 10:27:11.004246
30	30	127.0.0.1	2025-08-27 10:28:05.825157
31	20	127.0.0.1	2025-08-27 10:34:19.584072
32	20	127.0.0.1	2025-08-27 10:35:00.19184
33	20	127.0.0.1	2025-08-27 10:35:34.347515
34	20	127.0.0.1	2025-08-27 10:36:30.421724
35	20	127.0.0.1	2025-08-27 10:48:13.35205
36	30	127.0.0.1	2025-08-27 10:50:02.613701
37	30	127.0.0.1	2025-08-27 10:53:41.908281
38	20	127.0.0.1	2025-08-27 11:17:50.861759
39	20	127.0.0.1	2025-08-27 11:17:59.95111
40	30	127.0.0.1	2025-08-27 11:59:47.679714
41	30	127.0.0.1	2025-08-27 12:00:35.950132
42	30	127.0.0.1	2025-08-27 12:03:53.085528
43	20	127.0.0.1	2025-08-27 12:05:22.981984
44	20	127.0.0.1	2025-08-27 12:09:32.636352
45	20	127.0.0.1	2025-08-27 12:09:59.51822
46	20	127.0.0.1	2025-08-27 12:20:04.063972
47	20	127.0.0.1	2025-08-27 12:24:58.879633
48	20	127.0.0.1	2025-08-27 12:25:08.44141
49	20	127.0.0.1	2025-08-27 12:31:12.405762
50	20	127.0.0.1	2025-08-27 13:07:52.95229
51	20	127.0.0.1	2025-08-27 13:21:50.290988
52	20	127.0.0.1	2025-08-27 13:27:41.663351
53	20	127.0.0.1	2025-08-27 13:43:59.315598
54	20	127.0.0.1	2025-08-27 13:45:37.044972
55	20	127.0.0.1	2025-08-27 13:58:28.640173
56	20	127.0.0.1	2025-08-27 14:37:08.853063
57	30	127.0.0.1	2025-08-27 14:50:26.311006
58	30	127.0.0.1	2025-08-28 06:10:00.98687
59	30	127.0.0.1	2025-08-28 06:13:49.057621
60	20	127.0.0.1	2025-08-28 06:15:28.605642
61	30	127.0.0.1	2025-08-28 06:16:55.86132
62	30	127.0.0.1	2025-08-28 06:21:10.683693
63	20	127.0.0.1	2025-08-28 06:21:18.029572
64	20	127.0.0.1	2025-08-28 06:21:30.399318
65	30	127.0.0.1	2025-08-28 06:22:21.448835
66	20	127.0.0.1	2025-08-28 06:22:36.651452
67	30	127.0.0.1	2025-08-28 06:31:50.647048
68	30	127.0.0.1	2025-08-28 06:32:44.964485
69	30	127.0.0.1	2025-08-28 06:33:34.786528
70	30	127.0.0.1	2025-08-28 06:34:34.502525
71	30	127.0.0.1	2025-08-28 06:36:00.450017
72	30	127.0.0.1	2025-08-28 06:37:12.399015
73	30	127.0.0.1	2025-08-28 06:38:20.737924
74	30	127.0.0.1	2025-08-28 06:38:34.115827
75	30	127.0.0.1	2025-08-28 07:27:27.282978
76	20	127.0.0.1	2025-08-28 07:50:05.323506
77	20	127.0.0.1	2025-08-28 08:43:24.832384
78	20	127.0.0.1	2025-08-28 08:49:19.684516
79	20	127.0.0.1	2025-08-28 08:49:35.769069
80	30	127.0.0.1	2025-08-28 09:30:10.9555
81	20	127.0.0.1	2025-08-28 10:33:57.375865
82	20	127.0.0.1	2025-08-28 10:34:25.859343
83	33	127.0.0.1	2025-08-28 10:34:59.312968
84	38	127.0.0.1	2025-08-28 10:41:23.328885
85	39	127.0.0.1	2025-08-28 10:46:55.145998
86	20	127.0.0.1	2025-08-28 11:29:39.353868
87	30	127.0.0.1	2025-08-28 11:56:20.413106
88	30	127.0.0.1	2025-08-28 11:57:03.810841
89	30	127.0.0.1	2025-08-28 12:14:38.958739
90	30	127.0.0.1	2025-08-28 12:23:25.645315
91	30	127.0.0.1	2025-08-28 12:34:23.930639
92	30	127.0.0.1	2025-08-28 12:48:03.931057
93	30	::ffff:127.0.0.1	2025-08-28 12:49:25.106022
94	30	127.0.0.1	2025-08-28 12:56:02.715015
95	30	127.0.0.1	2025-08-28 13:19:57.272355
96	30	127.0.0.1	2025-08-28 13:21:20.093751
97	20	127.0.0.1	2025-08-28 14:04:47.151612
98	42	127.0.0.1	2025-08-30 09:48:29.529612
99	30	127.0.0.1	2025-08-31 06:16:22.114576
\.


--
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.logs (id, user_id, action, created_at) FROM stdin;
1	25	Ahmad Tareq from Jordan has registered successfully.	2025-08-27 08:02:45.405986
2	26	Ahmad Tareq, a Client from Jordan, has registered successfully.	2025-08-27 08:05:51.251758
3	28	Yousef Aql, a Freelancer from Jordan, has registered successfully.	2025-08-27 08:06:26.157907
4	4	Yousef Abuaqel, a Admin from Jordan, has logged in successfully.	2025-08-27 08:08:27.139018
5	4	Yousef Abuaqel, a Freelancer from Jordan, has created a portfolio.	2025-08-27 08:49:59.93285
6	4	Yousef Abuaqel, a Freelancer from Jordan, has created a portfolio.	2025-08-27 08:59:56.990673
7	4	Yousef Abuaqel, a Freelancer from Jordan,  has updated a portfolio.	2025-08-27 09:03:01.640713
8	4	Yousef Abuaqel has activated the account of Ahmed Ali, a Freelancer from Egypt.	2025-08-27 09:09:32.558766
9	4	Yousef Abuaqel has deactivated the account of Ahmed Ali, a Freelancer from Egypt.	2025-08-27 09:09:51.277055
10	4	Yousef Abuaqel (admin) has activated the account of Ahmed Ali, a Freelancer from Egypt.	2025-08-27 09:10:19.011039
11	4	Yousef Abuaqel (admin) has deactivated the account of Ahmed Ali (Freelancer).	2025-08-27 09:10:49.390502
12	29	us aq, a Freelancer from Jordan, has registered successfully.	2025-08-27 09:53:07.997976
13	29	us aq, a Freelancer from Jordan, has logged in successfully.	2025-08-27 09:53:08.580339
14	29	us aq, a Freelancer from Jordan, has logged in successfully.	2025-08-27 09:54:32.254931
15	30	Yousef  Abuaqel, a Freelancer from Jordan, has registered successfully.	2025-08-27 09:55:58.875017
16	30	Yousef  Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-27 09:58:31.848164
17	4	Yousef Abuaqel, a Freelancer from Jordan, has created a portfolio.	2025-08-27 10:01:07.573375
18	30	Yousef  Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-27 10:22:37.410848
19	30	Yousef  Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-27 10:27:11.160023
20	30	Yousef  Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-27 10:28:05.997359
21	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 10:34:19.739527
22	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 10:35:00.353546
23	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 10:35:34.5108
24	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 10:36:30.577639
25	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 10:48:13.523782
26	30	Yousef  Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-27 10:50:02.78507
27	30	Yousef  Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-27 10:53:42.065589
28	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 11:17:51.030308
29	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 11:18:00.104752
30	30	Yousef  Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-27 11:59:47.843131
31	30	Yousef  Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-27 12:00:36.102366
32	30	Yousef  Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-27 12:03:53.265878
33	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 12:05:23.14438
34	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 12:09:32.801637
35	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 12:09:59.67704
36	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 12:20:04.225338
37	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 12:24:59.031771
38	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 12:25:08.597928
39	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 12:31:12.560362
40	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 13:07:53.161861
41	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 13:21:50.465143
42	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 13:27:41.81363
43	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 13:43:59.47631
44	31	RASHED ALFOQHA, a Client from Jordan, has registered successfully.	2025-08-27 13:44:58.571403
45	31	RASHED ALFOQHA, a Client from Jordan, has logged in successfully.	2025-08-27 13:44:58.919582
46	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 13:45:37.190388
47	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 13:58:28.79555
48	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-27 14:37:09.030416
49	30	anas khaled, a Freelancer from Jordan, has logged in successfully.	2025-08-27 14:50:26.479336
50	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:10:01.183228
51	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:13:49.213423
52	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:15:28.753829
53	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:16:56.035701
54	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:21:10.862424
55	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:21:18.182948
56	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:21:30.546903
57	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:22:21.612064
58	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:22:36.796541
59	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:31:50.799751
60	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:32:45.156571
61	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:33:34.942939
62	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:34:34.657435
63	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:36:00.672828
64	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:37:12.554257
65	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:38:20.902505
66	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 06:38:34.297722
67	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 07:27:27.450354
68	4	Yousef Abuaqel, a Admin from Jordan, has logged in successfully.	2025-08-28 07:45:48.759789
69	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 07:50:05.479816
70	4	Yousef Abuaqel, a Admin from Jordan, has logged in successfully.	2025-08-28 07:51:31.713241
71	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 08:43:24.99465
72	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 08:49:19.844568
73	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 08:49:35.926515
74	32	RASHED ALFOQHA, a Client from Jordan, has registered successfully.	2025-08-28 09:10:14.79761
75	32	RASHED ALFOQHA, a Client from Jordan, has logged in successfully.	2025-08-28 09:10:15.161915
76	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 09:30:11.114493
77	32	RASHED ALFOQHA, a Client from Jordan, has logged in successfully.	2025-08-28 09:52:11.274575
78	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 10:33:57.570102
79	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 10:34:26.011181
80	33	RASHED ALFOQHA, a Freelancer from Jordan, has registered successfully.	2025-08-28 10:34:58.977766
81	33	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 10:34:59.465519
82	37	RASHED ALFOQHA, a Client from Jordan, has registered successfully.	2025-08-28 10:37:17.967693
83	37	RASHED ALFOQHA, a Client from Jordan, has logged in successfully.	2025-08-28 10:37:18.301135
84	38	RASHED ALFOQHA, a Freelancer from Jordan, has registered successfully.	2025-08-28 10:41:22.982316
85	38	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 10:41:23.485437
86	39	RASHED ALFOQHA, a Freelancer from Jordan, has registered successfully.	2025-08-28 10:46:54.802434
87	39	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 10:46:55.303551
88	40	Rashed Alfuqaha, a Client from Jordan, has registered successfully.	2025-08-28 10:51:19.190598
89	40	Rashed Alfuqaha, a Client from Jordan, has logged in successfully.	2025-08-28 10:51:19.513315
90	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 11:29:39.505497
91	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 11:56:20.80376
92	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 11:57:03.968972
93	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 12:14:39.110513
94	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 12:23:25.805887
95	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 12:34:24.10117
96	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 12:48:04.084993
97	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 12:49:25.262295
98	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 12:56:02.87455
99	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 13:19:57.539207
100	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-28 13:21:20.248901
101	20	RASHED ALFOQHA, a Freelancer from Jordan, has logged in successfully.	2025-08-28 14:04:47.341884
102	20	RASHED ALFOQHA, a Client from Jordan, has logged in successfully.	2025-08-28 14:05:44.378554
103	42	Rashed Alfoqha, a Freelancer from Jordan, has registered successfully.	2025-08-30 09:48:29.188376
104	42	Rashed Alfoqha, a Freelancer from Jordan, has logged in successfully.	2025-08-30 09:48:29.684948
105	43	Rashed Alfoqha, a Client from Jordan, has registered successfully.	2025-08-30 09:49:05.489163
106	43	Rashed Alfoqha, a Client from Jordan, has logged in successfully.	2025-08-30 09:49:05.795373
107	30	Yousef Abuaqel, a Freelancer from Jordan, has logged in successfully.	2025-08-31 06:16:22.318217
\.


--
-- Data for Name: message_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.message_logs (id, message_id, sender_id, receiver_id, logged_at, conversation_id) FROM stdin;
2	32	4	11	2025-08-27 07:03:48.938435	10
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.messages (id, conversation_id, sender_id, receiver_id, text, time_sent, image_url) FROM stdin;
14	11	4	11	تواصل معي 	2025-08-26 14:50:22.983835	\N
15	11	4	11	تواصل معي 	2025-08-26 14:51:02.28203	\N
16	11	4	11	تواصل معي 	2025-08-26 14:51:20.032023	\N
17	11	4	11	تواصل معي 	2025-08-26 14:53:01.149231	\N
18	11	4	11	تواصل معي 	2025-08-26 14:53:08.897022	\N
19	11	4	11	تواصل معي 	2025-08-26 14:53:11.566256	\N
20	11	4	11	تواصل معي 	2025-08-26 14:55:03.096596	\N
21	11	4	11	تواصل معي 	2025-08-26 14:55:37.421797	\N
22	11	4	11	تواصل معي 	2025-08-26 14:55:42.482543	\N
23	11	4	11	تواصل معي 	2025-08-26 14:55:49.441321	\N
24	10	4	11	hello	2025-08-27 06:13:38.186306	\N
25	10	4	11	hello	2025-08-27 06:21:06.305381	\N
26	10	4	11	this pic nice	2025-08-27 06:22:03.78345	https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg
27	10	4	11	this pic nice	2025-08-27 06:52:53.679102	https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg
28	10	4	11	this pic nice	2025-08-27 06:53:23.12881	https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg
29	10	4	11	this pic nice	2025-08-27 06:54:36.983089	https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg
30	10	4	11	this pic nice	2025-08-27 07:02:51.016902	https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg
31	10	4	11	this pic nice	2025-08-27 07:03:12.787428	https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg
32	10	4	11	this pic nice	2025-08-27 07:03:48.767693	https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, user_id, message, read_status, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payments (id, payer_id, receiver_id, amount, order_id, payment_date) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.permissions (id, permission) FROM stdin;
1	manage_users
2	manage_roles
3	create_project
4	view_project
5	apply_project
6	manage_payments
7	view_users
8	delete_user
9	edit_user
10	view_orders
11	create_order
12	delete_order
13	create_portfolio
14	enroll_course
15	view_freelancers
16	delete_freelancer
17	show_online
18	view_logs
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.plans (id, name, price, duration, description, features) FROM stdin;
1	Pro Plan	50.00	1	Unlock your full potential with the Pro Plan! Ideal for experienced freelancers ready to scale their business with advanced features and priority support.	{test,test2}
3	Basic Plan	9.99	30	Perfect for individuals who want to get started.	{"Access to basic features","Email support","1 user only"}
4	Pro Plan	29.99	30	Ideal for small teams that need advanced tools.	{"All Basic Plan features","Priority support","Up to 5 users","Advanced analytics"}
5	Enterprise Plan	99.99	30	Best for large organizations with custom needs.	{"All Pro Plan features","Dedicated account manager","Unlimited users","Custom integrations"}
\.


--
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.portfolios (id, freelancer_id, title, description, hourly_rate, work_url, added_at, skills, edit_at) FROM stdin;
4	30	Full-Stack Web Development	A showcase of my web development projects, including e-commerce websites, blogs, and corporate sites.	32.00	https://www.example.com/portfolio	2025-08-27 08:49:59.742412	{html,js}	\N
5	30	Web Developer Portfolio	A showcase of my web development projects, including e-commerce websites, blogs, and corporate sites.	50.00	https://www.example.com/portfolio	2025-08-27 08:59:56.79659	{html,js,css}	\N
30	30	Web 	A showcase of my web development projects, including e-commerce websites, blogs, and corporate sites.	45.00	https://www.example.com/portfolio	2025-08-27 10:01:07.395249	{html,js,css}	2025-08-28 09:52:33.321679
9	30	test	resrsr	12.00	https://www.example.com/portfolio	2025-08-28 09:52:48.554434	{HTML,CSS,JavaScript,React,Node.js,Express.js}	\N
10	30	فثسف	سشيسشيسشي	143.00	https://www.example.com/portfolio	2025-08-28 09:53:52.396659	{html}	\N
\.


--
-- Data for Name: project_assignments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.project_assignments (id, project_id, freelancer_id, assigned_at, status) FROM stdin;
1	6	20	2025-08-28 09:36:59.85552	active
2	15	42	2025-08-30 09:49:30.254113	active
3	15	42	2025-08-30 09:49:34.414355	active
4	15	42	2025-08-30 09:50:33.931908	active
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.projects (id, user_id, category_id, sub_category_id, title, description, budget_min, budget_max, duration, location, status, is_deleted, created_at, updated_at, assigned_freelancer_id) FROM stdin;
3	4	1	2	Build a landing page	I need a responsive landing page	100	300	7 days	Remote		f	2025-08-28 07:55:33.957026	2025-08-28 07:55:33.957026	\N
4	4	1	2	Build a landing page	I need a responsive landing page	100	300	7 days	Remote		f	2025-08-28 07:55:37.30764	2025-08-28 07:55:37.30764	\N
5	4	1	2	Build a landing page	I need a responsive landing page	100	300	7 days	Remote		f	2025-08-28 07:56:30.327654	2025-08-28 07:56:30.327654	\N
6	32	2	3	1111	saffffffffffffffffffffffffffffffffffffffffff	8	11	Less than 1 month	On-site		f	2025-08-28 09:36:59.200312	2025-08-28 09:36:59.200312	\N
7	32	2	3	2022222	اتنلللللللللل	26	33	1 to 3 months	Remote		f	2025-08-28 09:45:33.940477	2025-08-28 09:45:33.940477	\N
8	32	2	\N	adadadadadadadadadadadadadadadadadadadadadadadad	sadadadadadadadadadadadadadadadadadadadadadad	15	33	Less than 1 month	Remote		f	2025-08-28 10:23:36.091016	2025-08-28 10:23:36.091016	\N
9	40	6	14	afsfsafsafsaf	adwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww	22222	222222	Less than 1 month	On-site		f	2025-08-28 10:53:43.97922	2025-08-28 10:53:43.97922	\N
10	40	1	2	jyytjyjtyjyt	hjgdjjjjjjjjjjjyttjytjytj	111	1	1 to 3 months	Remote		f	2025-08-28 10:56:02.158068	2025-08-28 10:56:02.158068	\N
11	20	2	3	sadsadsa	adsadsadsadad	111	1111	1 to 3 months	On-site		f	2025-08-28 14:06:09.244959	2025-08-28 14:06:09.244959	\N
12	20	2	3	knjbuhgguyjjgyygujjuy	guykuyigfuyguyfgfuyfuyj	6	7	1 to 3 months	Remote		f	2025-08-28 14:07:25.854584	2025-08-28 14:07:25.854584	\N
13	20	1	2	ghhjbvhgfhkk	sdxgfxggfd	4	11	1 to 3 months	Remote		f	2025-08-28 14:10:31.923231	2025-08-28 14:10:31.923231	\N
14	20	1	2	fsfasfsafsaf	sdgsdgdsgsdg	3333	3333	1 to 3 months	Remote		f	2025-08-28 14:40:02.937138	2025-08-28 14:40:02.937138	\N
15	43	1	2	ssssss	sadsadsdsadsad	222	2222	1 to 3 months	Remote	available	f	2025-08-30 09:49:20.038109	2025-08-30 09:49:20.038109	\N
\.


--
-- Data for Name: receipts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.receipts (id, payment_id, receipt_url) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reviews (id, order_id, client_id, freelancer_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: role_permission; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.role_permission (id, role_id, permission_id) FROM stdin;
1	1	1
2	1	2
3	1	3
4	1	3
5	1	4
6	1	5
7	1	6
8	2	3
9	2	4
10	2	6
11	3	4
12	3	5
13	1	7
14	1	8
15	1	9
16	1	10
17	1	11
18	1	12
19	3	13
20	3	14
21	1	15
22	1	16
23	1	17
24	1	18
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.roles (id, role) FROM stdin;
1	Admin
2	Customer
3	Freelancer
4	Admin
5	Employee
6	Freelancer
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
Dpc4uhelF5VxRZjcN6lG6ce_-khTMCaj	{"cookie":{"originalMaxAge":86400000,"expires":"2025-09-01T06:33:34.603Z","secure":false,"httpOnly":false,"path":"/"},"adminUser":{"email":"admin@example.com","password":"password"}}	2025-09-01 06:33:35
gN_iCy92-KWKLzOSFyzsD2AouU4VK3TN	{"cookie":{"originalMaxAge":null,"expires":null,"secure":false,"httpOnly":false,"path":"/"},"adminUser":{"email":"admin@example.com","password":"password"}}	2025-08-31 12:09:39
\.


--
-- Data for Name: sub_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sub_categories (id, category_id, name, description, created_at) FROM stdin;
2	1	Some Subcategory	\N	2025-08-28 07:55:29.610147
3	2	Software Developer	Develop software applications and solutions.	2025-08-28 08:30:17.343888
4	2	Data Analyst	Analyze and interpret complex data sets.	2025-08-28 08:30:17.343888
5	2	Network Engineer	Design and maintain computer networks.	2025-08-28 08:30:17.343888
6	3	Administrative Assistant	Support office operations and administrative tasks.	2025-08-28 09:26:43.425181
7	3	Project Manager	Plan, execute, and close projects successfully.	2025-08-28 09:26:43.425181
8	3	Process Analyst	Evaluate and improve business processes.	2025-08-28 09:26:43.425181
9	4	Visual Designer	Create visual content for digital and print media.	2025-08-28 09:26:43.605558
10	4	UI/UX Designer	Design user interfaces and user experiences.	2025-08-28 09:26:43.605558
11	5	Content Writer	Write engaging content for websites and blogs.	2025-08-28 09:26:43.770053
12	5	Copywriter	Create persuasive marketing content.	2025-08-28 09:26:43.770053
13	6	Event Photographer	Capture moments at events and gatherings.	2025-08-28 09:26:43.93271
14	6	Portrait Photographer	Take professional portraits.	2025-08-28 09:26:43.93271
15	7	Sound Engineer	Mix and master audio recordings.	2025-08-28 09:26:44.111884
16	7	Music Producer	Produce music tracks and albums.	2025-08-28 09:26:44.111884
17	7	Audio Editor	Edit audio for clarity and quality.	2025-08-28 09:26:44.111884
18	8	Customer Service Representative	Provide support to customers remotely.	2025-08-28 09:26:44.274991
19	8	Financial Analyst	Analyze financial data and reports.	2025-08-28 09:26:44.274991
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.subscriptions (id, freelancer_id, plan_id, start_date, end_date, status) FROM stdin;
1	4	1	2025-08-24	2025-09-24	active
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, role_id, first_name, last_name, email, password, is_deleted, phone_number, country, profile_pic_url, username, reason_for_disruption, created_at, is_online, socket_id, violation_count, rating, rating_sum, rating_count, category_id) FROM stdin;
19	2	tala	tt	tala2@gmail.com	$2b$07$cg0Ug6flHPVH2upBIrmQ0ONFsMRrGQ9L.16qr8976h7dZoTWa0Xte	f	4445354365	jordan	\N	tala1	\N	2025-08-26 14:40:07.434701	f	\N	0	0.0	0.00	0	\N
7	3	Ahmed	Ali	ahmed@example.com	$2b$07$dxjKW85wEsATbqzKdt7/o.ZB2j.wcpUWVnLjBKZlgeQviNnMARUVm	t	0123456789	Egypt	\N	unknown_7	\N	2025-08-25 07:58:15.193302	f	\N	0	0.0	0.00	0	\N
29	3	us	aq	usaq@gmail.com	$2b$07$dE9Qf26HUnUupqS5uUx0g.Ny0Ruq1gAHVVEDpT8CRi./7LX3XUjJ6	f	0799641651	Jordan	\N	usfaq	\N	2025-08-27 09:53:07.827114	f	\N	0	0.0	0.00	0	\N
40	2	Rashed	Alfuqaha	rmsa@gmail.com	$2b$07$iAr.1/8quTHoGoNN6opR7ee0Hm5oKtKeksfEb7ODhtJX7LHzVwlI6	f	0799641651	Jordan	\N	rmsa	\N	2025-08-28 10:51:19.036271	f	\N	0	0.0	0.00	0	\N
41	1	Adam	Admin	adam.admin@example.com	$2b$10$abcdefghijklmnopqrstuv1234567890abcdefghi	f	+1-555-0001	US	\N	adam_admin	\N	2025-08-28 10:55:35.295244	f	\N	0	0.0	0.00	0	\N
42	3	Rashed	Alfoqha	guest@gmail.com	$2b$07$zcNw.DT1.hw1IVwE/W74FeGwfl7fiTA3ylRXA8ypV6z1zkV8FrbUq	f	0789305553	Jordan	\N	Guest	\N	2025-08-30 09:48:29.004897	f	\N	0	0.0	0.00	0	1
4	1	Yousef	Abuaqel	usfaql@gmail.com	$2b$07$4DfsEedYgZCnMr53wzP2D.zHw6tnDT4dv6ftONRRo4V34vTtztIRa	f	0799641651	Jordan	\N	unknown_4	Your account has been suspended due to violations. Please contact the support team.	2025-08-25 07:58:15.193302	t	\N	11	0.0	0.00	0	\N
21	2	Ahmad	Tareq	ahmad@gmail.com	$2b$07$kSJ6DQerlNUt55VKBqmq4.VLB4k3khShNbFRf86gdlAiRPRWuTDmi	f	0789991280	Jordan	\N	adtq	\N	2025-08-27 07:58:15.660361	f	\N	0	0.0	0.00	0	\N
22	2	Ahmad	Tareq	ahma1@gmail.com	$2b$07$CKs0LQwRWyvBA2ZqzI7Sx.Ah6Su/8xrqOHN.z5uEa/c8y77jTH8Pe	f	0789991280	Jordan	\N	adtq	\N	2025-08-27 07:58:37.218392	f	\N	0	0.0	0.00	0	\N
23	2	Ahmad	Tareq	ahma2@gmail.com	$2b$07$YU/MIyJ1dhZStJRkxxNU2.aSTmUtClH8FWzim44YE.qxiI3bg1HjK	f	0789991280	Jordan	\N	adtq	\N	2025-08-27 08:02:07.544716	f	\N	0	0.0	0.00	0	\N
25	2	Ahmad	Tareq	ahma3@gmail.com	$2b$07$tWNMp0t0fNAhoruIHNc/uOuPGCtJuZAvHV.BBCN6b.adkFY3TS3hu	f	0789991280	Jordan	\N	adtq	\N	2025-08-27 08:02:45.243162	f	\N	0	0.0	0.00	0	\N
8	1	Rashed	Alfoqha	rashed@example.com	$2b$07$6L07Ma6m2WM7EJTzt1bL3.q55PbcOVZeh8IZo3TzSKbpR5.p6BdDK	t	+962790000001	Jordan	\N	unknown_8	\N	2025-08-25 07:58:15.193302	f	\N	0	0.0	0.00	0	\N
9	1	Rashed	Alfoqha	rashed@gmail.com	$2b$07$D4d5CpVJPXENYFUCpCvPouytaFThFahsOv.JtbkiFyUVHuMtQSdsC	t	+962790000001	Jordan	\N	unknown_9	\N	2025-08-25 07:58:15.193302	f	\N	0	0.0	0.00	0	\N
10	2	leena	ahmad	lena.lena@example.com	$2b$07$UWPtld41Mq1.VY.b2lGixu6UcfHJE2wuZ0TqULPDjMahxMF5cpZSC	t	+1234567890	USA	https://example.com/images/john.jpg	unknown_10	\N	2025-08-25 07:58:15.193302	f	\N	0	0.0	0.00	0	\N
26	2	Ahmad	Tareq	ahma24@gmail.com	$2b$07$WrAOhiOa3ATUoTsvW3jXIO6wZaVPN5SVDmfkTTcoKhKzC9/0GDOme	f	0789991280	Jordan	\N	adtq	\N	2025-08-27 08:05:51.026905	f	\N	0	0.0	0.00	0	\N
14	2	Usf	Aql	usf@gmail.com	$2b$07$bLHNcHiYhgcB3VCjb/Xu6OOtfsCE0VV4ynVd/pngsIJqT2Wh3VWYy	f	0789991280	Jordan	\N	unknown_14	\N	2025-08-25 10:26:34.240527	f	\N	0	0.0	0.00	0	\N
15	1	Usf	Aql	usf_admin@gmail.com	$2b$07$pux/EwMhW1PpEN1XR4waSOh0uGTkxlTX1HECfVCr8ZewvrywR3PZi	f	0789991280	Jordan	\N	unknown_15	\N	2025-08-25 10:29:33.172484	t	\N	0	0.0	0.00	0	\N
31	2	RASHED	ALFOQHA	rashedmohammadalfoqha1@gmail.com	$2b$07$Ld8tX4rxrN9bwYZWyblI7eg8ILPTkhiUWtjYU8ROmGy2pT7MMfdFy	f	0799641651	Jordan	\N	johndoe123	\N	2025-08-27 13:44:58.390407	f	\N	0	0.0	0.00	0	\N
17	3	tala	tt	tala@gmail.com	$2b$07$EL9uKTWiqWA2PIClKxba9eipykUVzr4GqVSOy72NGf/dC7w.LntWy	f	4445354365	jordan	\N	unknown_17	\N	2025-08-26 14:25:53.142144	f	\N	0	0.0	0.00	0	\N
18	2	dddd	dddddd	lenaa@gmail.com	$2b$07$I/CGyZvAP.EdD/oCgtZVxeijsBiWSAeYWjPJJQKylSlfltm0KCCw6	f	4445354365	jordan	\N	unknown_18	\N	2025-08-26 14:26:57.660051	f	\N	0	0.0	0.00	0	\N
11	2	leen	sami	leen@gmail.com	$2b$07$s5ePLVDAW.GB7VYiNbMEMeCa.e8iQ/fSHmYB0rVgUeobVVTLpa52a	t	+1234567890	jordan	\N	unknown_11	\N	2025-08-25 07:58:15.193302	f	\N	0	0.0	0.00	0	\N
32	2	RASHED	ALFOQHA	rashedmohammadalfoqha11@gmail.com	$2b$07$UZE7ifPIZufBI9BYmuFIy.MbHhZEfCfGu8b2h1TLVrcHd.QZ1P.DW	f	0799641651	Jordan	\N	usfaq1	\N	2025-08-28 09:10:14.605253	f	\N	0	0.0	0.00	0	\N
28	3	Yousef	Aql	ahma241@gmail.com	$2b$07$qzAEFeNqiYCwk65CZszSfexd7Wu93BQS0HHssB6BkJ98h39OIaeEe	f	0789991280	Jordan	\N	adtq	\N	2025-08-27 08:06:25.986462	f	\N	0	0.0	0.00	0	\N
30	3	Yousef	Abuaqel	usfaql1@gmail.com	$2b$07$2HIo2PCHdbE4cgAIiVx.Cu0x/s5uqejJkF9upT1pS.dWeKFD6KrL2	f	0789991280	Jordan	\N	usf	\N	2025-08-27 09:55:58.697902	t	\N	0	0.0	0.00	0	\N
33	3	RASHED	ALFOQHA	rashedmohammadalfoqha111@gmail.com	$2b$07$pRZ4y8xj26.v3h6uix.XTeruhZAsZyWF/EA9Fm.3U6AaqFiBFa2pa	f	0799641651	Jordan	\N	hjkbhjghjghjg	\N	2025-08-28 10:34:58.814743	f	\N	0	0.0	0.00	0	\N
37	2	RASHED	ALFOQHA	rashed11@gmail.com	$2b$07$R1MToI8FAfMWS2GPTR69H.EsShjxSM6XbXMaPSRZAoN7cjEyjJCQS	f	0799641651	Jordan	\N	usfaq	\N	2025-08-28 10:37:17.807336	f	\N	0	0.0	0.00	0	\N
38	3	RASHED	ALFOQHA	rashedmohammad@gmail.com	$2b$07$S2jFsKjiGx20UupeBr3GQOZJsQQCo2yn7Mw/woy1D9BzCL0x2A6R2	f	0799641651	Jordan	\N	rashedAlfoqha	\N	2025-08-28 10:41:22.815803	f	\N	0	0.0	0.00	0	\N
39	3	RASHED	ALFOQHA	rashedmohammadalfoqha20@gmail.com	$2b$07$bUrXB9w6sh81HPLZ7j1EveTT9/b2GLunsSEx0NaqUY0kHpGRnscA2	f	0799641651	Jordan	\N	hjkbhjghjghjg	\N	2025-08-28 10:46:54.639513	f	\N	0	0.0	0.00	0	\N
20	2	RASHED	ALFOQHA	rashedmohammadalfoqha@gmail.com	$2b$07$9M5n6bbGo72qzsnEsmtVd.VghLnH5W7botXpwsWQN3pRIrlCM/B7O	f	0799641651	Jordan	\N	rashedAlfoqha	\N	2025-08-27 07:23:23.110608	f	\N	0	0.0	0.00	0	\N
43	2	Rashed	Alfoqha	guest1@gmail.com	$2b$07$i/3Lnwa4E27gDRQvgxTE.uH7kl84j5OMa8UmZN7b06cUWbhV.Bp7.	f	0789305553	Jordan	\N	rashed	\N	2025-08-30 09:49:05.342869	t	\N	0	0.0	0.00	0	\N
\.


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.appointments_id_seq', 5, true);


--
-- Name: attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.attachments_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.categories_id_seq', 11, true);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.conversations_id_seq', 11, true);


--
-- Name: course_enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.course_enrollments_id_seq', 2, true);


--
-- Name: course_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.course_materials_id_seq', 1, false);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.courses_id_seq', 6, true);


--
-- Name: customer_verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customer_verifications_id_seq', 1, false);


--
-- Name: feedbacks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.feedbacks_id_seq', 2, true);


--
-- Name: freelancer_verification_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.freelancer_verification_categories_id_seq', 1, false);


--
-- Name: freelancer_verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.freelancer_verifications_id_seq', 1, false);


--
-- Name: logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.logs_id_seq', 107, true);


--
-- Name: message_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.message_logs_id_seq', 2, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.messages_id_seq', 32, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.permissions_id_seq', 18, true);


--
-- Name: plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.plans_id_seq', 5, true);


--
-- Name: portfolios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.portfolios_id_seq', 11, true);


--
-- Name: project_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.project_assignments_id_seq', 4, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.projects_id_seq', 15, true);


--
-- Name: receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.receipts_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: role_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.role_permission_id_seq', 24, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: sub_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sub_categories_id_seq', 19, true);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 1, true);


--
-- Name: user_logins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_logins_id_seq', 99, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 43, true);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: course_enrollments course_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_pkey PRIMARY KEY (id);


--
-- Name: course_materials course_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.course_materials
    ADD CONSTRAINT course_materials_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: customer_verifications customer_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_verifications
    ADD CONSTRAINT customer_verifications_pkey PRIMARY KEY (id);


--
-- Name: customer_verifications customer_verifications_user_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_verifications
    ADD CONSTRAINT customer_verifications_user_id_key UNIQUE (user_id);


--
-- Name: feedbacks feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id);


--
-- Name: freelancer_verification_categories freelancer_verification_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.freelancer_verification_categories
    ADD CONSTRAINT freelancer_verification_categories_pkey PRIMARY KEY (id);


--
-- Name: freelancer_verification_categories freelancer_verification_categories_user_id_category_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.freelancer_verification_categories
    ADD CONSTRAINT freelancer_verification_categories_user_id_category_id_key UNIQUE (user_id, category_id);


--
-- Name: freelancer_verifications freelancer_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.freelancer_verifications
    ADD CONSTRAINT freelancer_verifications_pkey PRIMARY KEY (id);


--
-- Name: freelancer_verifications freelancer_verifications_user_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.freelancer_verifications
    ADD CONSTRAINT freelancer_verifications_user_id_key UNIQUE (user_id);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- Name: message_logs message_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.message_logs
    ADD CONSTRAINT message_logs_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: portfolios portfolios_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_pkey PRIMARY KEY (id);


--
-- Name: project_assignments project_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.project_assignments
    ADD CONSTRAINT project_assignments_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: receipts receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: role_permission role_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: sub_categories sub_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sub_categories
    ADD CONSTRAINT sub_categories_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: ip_adress user_logins_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ip_adress
    ADD CONSTRAINT user_logins_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: idx_customer_verifications_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_customer_verifications_user_id ON public.customer_verifications USING btree (user_id);


--
-- Name: idx_freelancer_ver_cat_category; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_freelancer_ver_cat_category ON public.freelancer_verification_categories USING btree (category_id);


--
-- Name: idx_freelancer_ver_cat_user; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_freelancer_ver_cat_user ON public.freelancer_verification_categories USING btree (user_id);


--
-- Name: idx_freelancer_verifications_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_freelancer_verifications_user_id ON public.freelancer_verifications USING btree (user_id);


--
-- Name: appointments appointments_freelancer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES public.users(id);


--
-- Name: message_logs conversation; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.message_logs
    ADD CONSTRAINT conversation FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: course_enrollments course_enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: course_enrollments course_enrollments_freelancer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES public.users(id);


--
-- Name: course_materials course_materials_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.course_materials
    ADD CONSTRAINT course_materials_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: customer_verifications customer_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_verifications
    ADD CONSTRAINT customer_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: feedbacks feedbacks_freelancer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES public.users(id);


--
-- Name: feedbacks feedbacks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: projects fk_projects_assigned_freelancer; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_assigned_freelancer FOREIGN KEY (assigned_freelancer_id) REFERENCES public.users(id);


--
-- Name: projects fk_projects_category; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: projects fk_projects_sub_category; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_sub_category FOREIGN KEY (sub_category_id) REFERENCES public.sub_categories(id) ON DELETE SET NULL;


--
-- Name: projects fk_projects_user; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations freelancer; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT freelancer FOREIGN KEY (freelancer_id) REFERENCES public.users(id);


--
-- Name: freelancer_verification_categories freelancer_verification_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.freelancer_verification_categories
    ADD CONSTRAINT freelancer_verification_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: freelancer_verification_categories freelancer_verification_categories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.freelancer_verification_categories
    ADD CONSTRAINT freelancer_verification_categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: freelancer_verifications freelancer_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.freelancer_verifications
    ADD CONSTRAINT freelancer_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: logs logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: message_logs message; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.message_logs
    ADD CONSTRAINT message FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: conversations owner; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT owner FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: payments payments_payer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payer_id_fkey FOREIGN KEY (payer_id) REFERENCES public.users(id);


--
-- Name: payments payments_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id);


--
-- Name: portfolios portfolios_freelancer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES public.users(id);


--
-- Name: project_assignments project_assignments_freelancer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.project_assignments
    ADD CONSTRAINT project_assignments_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_assignments project_assignments_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.project_assignments
    ADD CONSTRAINT project_assignments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: receipts receipts_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: message_logs receiver; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.message_logs
    ADD CONSTRAINT receiver FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_freelancer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES public.users(id);


--
-- Name: role_permission role_permission_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id);


--
-- Name: role_permission role_permission_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: message_logs sender; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.message_logs
    ADD CONSTRAINT sender FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sub_categories sub_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sub_categories
    ADD CONSTRAINT sub_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_freelancer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES public.users(id);


--
-- Name: ip_adress user_logins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ip_adress
    ADD CONSTRAINT user_logins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict IPFYKMQd7DfshaffuDrjim0R4sOZ4gIwJeRib2iJQp9bklkAdYjweMS55LRmF3Y

