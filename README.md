# Ecommerce Marketplace

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Spring Boot
- Spring Security
- JWT Authentication
- JPA / Hibernate

### Database
- MySQL

---

## Project Structure

ecommerce-app/
│
├── frontend/
├── backend/

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

---

## Environment Variables

Create:

backend/.env

Use:

- DB_URL
- DB_USERNAME
- DB_PASSWORD
- JWT_SECRET
- MAIL_USERNAME
- MAIL_PASSWORD
- MAIL_FROM