## Database Setup

This project uses a shared Aiven Cloud MySQL database.

The database is hosted online, so contributors do not need to create a local
MySQL database using XAMPP.

### Environment Setup

Copy:

```text
.env.example
```

and create:

```text
.env.local
```

Ask the project administrator for the shared Aiven database credentials.

Your `.env.local` should contain:

```env
DB_HOST=YOUR_AIVEN_HOST
DB_PORT=YOUR_AIVEN_PORT
DB_USER=YOUR_AIVEN_USER
DB_PASSWORD=YOUR_AIVEN_PASSWORD
DB_NAME=defaultdb
DB_CA_CERT_PATH=certs/ca.pem
```

Never commit `.env.local` or database passwords to GitHub.

### SSL Certificate

The Aiven CA certificate is stored at:

```text
certs/ca.pem
```

### Test Database Connection

Run:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000/api/db-test
```

A successful connection should return:

```json
{
  "success": true,
  "message": "MySQL connected successfully"
}
```