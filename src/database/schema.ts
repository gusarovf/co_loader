export const nonPfxTbls = {
  updateTbl: "updates",
}

export const mainPfxTbls = {
  co: "co",
}

export const co = (postfix: string): string =>
  `CREATE TABLE IF NOT EXISTS ${mainPfxTbls.co}${postfix}
    (
     id SERIAL PRIMARY KEY,
     update_id INTEGER NOT NULL,
     ccode INTEGER NOT NULL,
     oldctbank VARCHAR(100),
     newctbank VARCHAR(100),
     csname VARCHAR(200) NOT NULL,
     cnamer VARCHAR(300) NOT NULL,
     oldcopf VARCHAR(20),
     newcopf VARCHAR(20),
     cregnum INTEGER NOT NULL,
     oldcregnr VARCHAR(20),
     newcregnr VARCHAR(20),
     cdreg VARCHAR(20),
     lic VARCHAR(10),
     strcuraddr VARCHAR(200),
     ogrn VARCHAR(13) NOT NULL,
     FOREIGN KEY (update_id) REFERENCES ${nonPfxTbls.updateTbl} (id) ON DELETE CASCADE ON UPDATE CASCADE
    ); 
  `
export const updates = (): string =>
  `CREATE TABLE IF NOT EXISTS ${nonPfxTbls.updateTbl}
    (
        id SERIAL PRIMARY KEY,
        tables_postfix VARCHAR(20) NOT NULL,
        is_loaded SMALLINT DEFAULT 0,
        are_tables_exist SMALLINT DEFAULT 1,
        total_records INTEGER NOT NULL,
        loaded_at TIMESTAMP DEFAULT NOW()
    );`
