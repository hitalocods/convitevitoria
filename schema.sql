-- ==========================================================================
-- SCRIPT SQL PARA O BANCO NEON (PostgreSQL) 🍒
-- Execute no SQL Editor do seu painel na Neon.tech
-- ==========================================================================

CREATE TABLE IF NOT EXISTS rsvps (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    attending BOOLEAN NOT NULL DEFAULT TRUE,
    companions_count INT DEFAULT 0,
    companion_names TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para buscas rápidas por nome
CREATE INDEX IF NOT EXISTS idx_rsvps_name ON rsvps(name);
