# QBT Desktop Build

This build embeds the Express API and SQLite database inside Electron. It does not spawn the Electron executable as a backend process.

## Windows build
1. Extract this folder.
2. Run `BUILD_WINDOWS_EXE.bat`.
3. Install `release\QBT Management System Setup 0.0.0.exe`.
4. MySQL/MariaDB/XAMPP/phpMyAdmin are not required.

## Runtime data
The writable database is copied on first launch to:
`%APPDATA%\qbt_management_system\data\qbt.db`

Backend log:
`%APPDATA%\qbt_management_system\qbt-backend.log`

API health endpoint:
`http://127.0.0.1:5000/api/health`
