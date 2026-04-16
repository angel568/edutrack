# EduTrack v2 — Sistema de Gestión Escolar

## Stack tecnológico

| Capa       | Tecnología                        |
|------------|-----------------------------------|
| Frontend   | React 18 + TypeScript + Vite      |
| Estilos    | Tailwind CSS + CSS Variables      |
| Estado     | Zustand (persistido)              |
| Backend    | Node.js + Express.js              |
| ORM        | Sequelize v6                      |
| Base datos | **MySQL**                         |
| Auth       | JWT + bcryptjs                    |
| Reportes   | ExcelJS + PDFKit                  |
| Pruebas    | Jest + Supertest + Playwright     |

---

## Instalación

### 1. Requisitos previos
- Node.js ≥ 18
- MySQL 8.0+ corriendo localmente (o acceso a MySQL remoto)

### 2. Base de datos
```sql
CREATE DATABASE edutrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Backend
```bash
cd backend
cp .env.example .env
# Edita .env con tus credenciales de MySQL
npm install
npm run dev
```

El servidor corre en **http://localhost:5000**  
Sequelize crea las tablas automáticamente (`sync: alter`).

### 4. Seed (datos de prueba)
```bash
cd backend
node src/utils/seed.js
```

### 5. Frontend
```bash
cd frontend
npm install
npm run dev
```

La app corre en **http://localhost:5173**

---

## Credenciales de acceso

| Rol         | Email                      | Contraseña      |
|-------------|----------------------------|-----------------|
| Admin       | admin@edutrack.do          | Admin123!       |
| Profesor    | mrodriguez@edutrack.do     | Profesor123!    |
| Estudiante  | jmartinez@edutrack.do      | Estudiante123!  |

---

## Endpoints principales

### Auth
| Método | Ruta                  | Acceso        |
|--------|-----------------------|---------------|
| POST   | /api/auth/login       | Público       |
| GET    | /api/auth/me          | Autenticado   |
| POST   | /api/auth/register    | Admin         |
| GET    | /api/auth/users       | Admin         |

### Reportes (nuevo en v2)
| Método | Ruta                              | Formato |
|--------|-----------------------------------|---------|
| GET    | /api/reportes/calificaciones/excel | .xlsx  |
| GET    | /api/reportes/calificaciones/pdf   | .pdf   |
| GET    | /api/reportes/asistencia/excel     | .xlsx  |

Parámetros opcionales: `?periodo=2025-1&materiaId=1`

---

## Estructura del proyecto

```
edutrack-v2/
├── backend/
│   ├── src/
│   │   ├── config/       # db.js (Sequelize + MySQL)
│   │   ├── controllers/  # auth, estudiante, materia, asistencia, calificacion, dashboard, reporte
│   │   ├── middleware/   # auth.js, errorHandler.js
│   │   ├── models/       # User, Estudiante, Materia, Asistencia, Calificacion + index (asociaciones)
│   │   ├── routes/       # index.js (todas las rutas)
│   │   ├── utils/        # seed.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/          # services.ts (todos los endpoints)
    │   ├── components/   # Layout (sidebar), ui
    │   ├── pages/        # auth, dashboard, estudiantes, materias, asistencia, calificaciones, reportes
    │   ├── store/        # authStore.ts (Zustand)
    │   ├── App.tsx
    │   └── index.css
    └── package.json
```

---

## Variables de entorno (.env)

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=edutrack
DB_USER=root
DB_PASSWORD=tu_password

JWT_SECRET=edutrack_super_secret_jwt_key_2025
JWT_EXPIRES_IN=8h

CLIENT_URL=http://localhost:5173
```
