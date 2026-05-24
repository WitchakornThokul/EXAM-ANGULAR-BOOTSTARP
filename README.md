# PHP + Angular + Bootstrap Starter

Starter workspace for a web app with:

- PHP backend for XAMPP / Apache
- MySQL database managed by phpMyAdmin
- Angular frontend
- Bootstrap styling

## Project Layout

```text
backend/
  api/
    config.php
    db.php
    health.php
    users.php
  sql/
    schema.sql
frontend/
  angular.json
  package.json
  src/
    app/
    environments/
    index.html
    main.ts
    styles.css
```

## Setup with XAMPP

1. Install and start XAMPP.
2. Start `Apache` and `MySQL`.
3. Import `backend/sql/schema.sql` in phpMyAdmin.
4. Put the `backend` folder inside `htdocs` or map your Apache document root to this workspace.
5. Open `http://localhost/exam/backend/api/health.php` to verify PHP works.

## Angular Frontend

1. Open a terminal in `frontend`.
2. Run `npm install`.
3. Run `npm start`.
4. The app calls the PHP API at `http://localhost/exam/backend/api` by default.

## Database

The default database name is `ecommerce_db`.
The starter backend is configured to connect with `ACRUX` / `ACCR` on `127.0.0.1`.

If you change the MySQL user or password in XAMPP, update `backend/api/config.php` to match.

## API Endpoints

- `GET /backend/api/health.php`
- `GET /backend/api/users.php`

## Notes

This is a starter template. If you want, I can also generate the full CRUD screens next.