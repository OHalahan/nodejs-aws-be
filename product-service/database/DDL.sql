CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE DATABASE nodejs_aws;

CREATE TABLE IF NOT EXISTS products
(
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       text NOT NULL,
    description text,
    image_url   text,
    price       integer
);

CREATE TABLE IF NOT EXISTS stocks
(
    id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id uuid,
    count      integer,
    FOREIGN KEY ("product_id") REFERENCES "products" ("id")
);
