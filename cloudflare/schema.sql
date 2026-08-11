PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT,password_hash TEXT NOT NULL,password_salt TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires_at TEXT NOT NULL,created_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS farms(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,name TEXT NOT NULL,created_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS plots(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,farm_id TEXT,name TEXT NOT NULL,snapshot_json TEXT,revision INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL,created_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,FOREIGN KEY(farm_id) REFERENCES farms(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS conversations(id TEXT PRIMARY KEY,user_id TEXT,channel TEXT NOT NULL,external_id TEXT,plot_id TEXT,messages_json TEXT NOT NULL DEFAULT '[]',updated_at TEXT NOT NULL,created_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,FOREIGN KEY(plot_id) REFERENCES plots(id) ON DELETE SET NULL);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_plots_user ON plots(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_external ON conversations(channel,external_id);