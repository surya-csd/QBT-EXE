# SQLite conversion notes

- Original DB: MariaDB/MySQL `qbt_management_system`.
- Desktop DB: SQLite `electron/qbt.db`.
- API routes and React UI remain unchanged.
- MySQL connection variables are no longer required by the desktop build.
- The first desktop launch copies the bundled database to the user's writable app-data directory.
- Subsequent launches use that local copy, so client-created/edited data persists.
