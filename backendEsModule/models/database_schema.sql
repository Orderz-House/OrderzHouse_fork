-- ==============================
-- 1) الجداول الأساسية
-- ==============================
CREATE TABLE Roles (
    id SERIAL PRIMARY KEY,
    role VARCHAR(100)
);

CREATE TABLE Permissions (
    id SERIAL PRIMARY KEY,
    permission VARCHAR(100)
);

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(50),
    role_id INT REFERENCES Roles(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    phone_number VARCHAR(20),
    country VARCHAR(100),
    national_number VARCHAR(50),
    profile_pic_url TEXT,
    bio TEXT,
    skills TEXT,
    location VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    date_started TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT
);

CREATE TABLE Plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price NUMERIC(10,2),
    features TEXT
);

CREATE TABLE Courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    price NUMERIC(10,2)
);

-- ==============================
-- 2) الجداول المرتبطة بالمستخدم
-- ==============================
CREATE TABLE IP_Addresses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    ip_address VARCHAR(50)
);

CREATE TABLE Logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    action TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Feedbacks (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Portfolios (
    id SERIAL PRIMARY KEY,
    freelancer_id INT REFERENCES Users(id),
    title VARCHAR(255),
    description TEXT,
    skills TEXT,
    hourly_rate NUMERIC(10,2),
    work_url TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 3) الطلبات والدفع
-- ==============================
CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES Users(id),
    category_id INT REFERENCES Categories(id),
    description TEXT,
    budget NUMERIC(10,2),
    status VARCHAR(50)
);

CREATE TABLE Order_Assignments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(id),
    freelancer_id INT REFERENCES Users(id),
    status VARCHAR(50)
);

CREATE TABLE Attachments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(id),
    file_url TEXT
);

CREATE TABLE Reviews (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(id),
    user_id INT REFERENCES Users(id),
    rating INT,
    comment TEXT
);

CREATE TABLE Payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(id),
    user_id INT REFERENCES Users(id),
    amount NUMERIC(10,2),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Receipts (
    id SERIAL PRIMARY KEY,
    payment_id INT REFERENCES Payments(id),
    receipt_url TEXT
);

-- ==============================
-- 4) الاشتراكات
-- ==============================
CREATE TABLE Subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),
    plan_id INT REFERENCES Plans(id),
    start_date DATE,
    end_date DATE
);

-- ==============================
-- 5) الكورسات
-- ==============================
CREATE TABLE Course_Enrollments (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES Courses(id),
    user_id INT REFERENCES Users(id),
    progress INT,
    status VARCHAR(50)
);

CREATE TABLE Course_Materials (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES Courses(id),
    file_url TEXT
);

-- ==============================
-- 6) صلاحيات الأدوار
-- ==============================
CREATE TABLE Roles_Permissions (
    id SERIAL PRIMARY KEY,
    role_id INT REFERENCES Roles(id),
    permission_id INT REFERENCES Permissions(id)
);
