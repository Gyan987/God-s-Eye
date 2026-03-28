# GOD'S EYE - Lost & Found Network

A modern full-stack platform to report lost and found items, discover possible matches, and reconnect owners with their belongings.

## Stack

- Frontend: React + Tailwind CSS + Framer Motion + Vite
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth/Security: JWT, bcrypt, input validation, rate limiting, helmet
- Storage: Cloudinary image upload
- Alerts: Email notifications (SMTP)

## Features Implemented

- Report lost items and found items (with image upload)
- Search items by name, category, location, and date
- Smart matching suggestions with "Possible Match Found"
- Item detail page with contact and claim flows
- Sign up, login, logout (JWT)
- User dashboard: view posts, delete posts, mark returned
- Notifications feed for possible matches
- Fake listing reports
- Admin dashboard: user overview, moderation, ban users
- Dark/light mode toggle and responsive modern card UI

## Folder Structure

```
gods-eye-app
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   └── utils
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── README.md
```

## API Endpoints

- POST /lost-items
- POST /found-items
- GET /lost-items
- GET /found-items
- GET /search
- PUT /update-item
- DELETE /delete-item

Additional:

- GET /items/:id
- GET /my-posts
- PUT /mark-returned
- POST /report-fake
- GET /notifications
- Auth: /auth/signup, /auth/login, /auth/me
- Admin: /admin/dashboard, /admin/users, /admin/ban-user/:userId

## Run Locally

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Notes

- Add Cloudinary credentials in backend `.env` for image upload.
- Add SMTP credentials for email alerts.
- For production: enforce stricter CORS, add CSRF strategy if using cookies, and add audit logging.
