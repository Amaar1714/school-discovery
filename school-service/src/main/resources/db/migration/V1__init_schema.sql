CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE schools (
    urn BIGINT PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    postcode VARCHAR(20),
    address VARCHAR(1000),
    phase_of_education VARCHAR(100),
    type VARCHAR(200),
    status VARCHAR(100),
    capacity INT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOMETRY(Point, 4326),
    school_website VARCHAR(500),
    phone VARCHAR(50),
    local_authority VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schools_location ON schools USING GIST(location);
CREATE INDEX idx_schools_postcode ON schools(postcode);
CREATE INDEX idx_schools_type ON schools(type);
CREATE INDEX idx_schools_phase ON schools(phase_of_education);

CREATE TABLE ofsted_ratings (
    id BIGSERIAL PRIMARY KEY,
    urn BIGINT NOT NULL REFERENCES schools(urn) ON DELETE CASCADE,
    overall_effectiveness VARCHAR(50),
    inspection_date DATE,
    inspection_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(urn)
);

CREATE INDEX idx_ofsted_urn ON ofsted_ratings(urn);

CREATE TABLE academic_metrics (
    id BIGSERIAL PRIMARY KEY,
    urn BIGINT NOT NULL REFERENCES schools(urn) ON DELETE CASCADE,
    metric_name VARCHAR(200) NOT NULL,
    value VARCHAR(100),
    year VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_academic_urn ON academic_metrics(urn);
