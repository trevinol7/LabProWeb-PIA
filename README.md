# 🏙️ Monterrey Reporta

Plataforma web ciudadana para reportar problemas urbanos (baches, alumbrado, basura, etc.) al municipio.

**Stack:** Node.js + Express + MySQL + JWT

---

## ⚙️ Requisitos previos

Antes de instalar, asegúrate de tener:

- [Node.js v16+](https://nodejs.org/)
- [XAMPP](https://www.apachefriends.org/) (o cualquier MySQL activo)
- Git

---

## 🚀 Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/trevinol7/LabProWeb-PIA.git
cd LabProWeb-PIA
```

### 2. Instalar dependencias de Node.js

```bash
npm install
```

### 3. Configurar la base de datos

#### Opción A — phpMyAdmin (XAMPP) ✅ Recomendado

1. Abre XAMPP y **inicia Apache y MySQL**
2. Ve a `http://localhost/phpmyadmin`
3. Haz clic en **"Nueva"** (barra lateral izquierda) para crear una base de datos
4. Escribe el nombre: `monterrey_reporta` → clic en **Crear**
5. Con la base de datos `monterrey_reporta` seleccionada, haz clic en la pestaña **"Importar"**
6. Haz clic en **"Seleccionar archivo"** y elige el archivo `database.sql` del proyecto
7. Deja todo por defecto y clic en **"Continuar"** (botón al final)
8. ✅ Deberías ver el mensaje: *"Se ha ejecutado correctamente"*

#### Opción B — MySQL desde terminal

```bash
# Acceder a MySQL (si tienes contraseña, agrega -p al final)
mysql -u root

# Dentro de MySQL, ejecutar:
source /ruta/al/proyecto/database.sql
```

> En Windows con XAMPP, MySQL suele estar en:  
> `C:\xampp\mysql\bin\mysql.exe`

---

### 4. Crear el archivo `.env`

Crea un archivo llamado `.env` en la raíz del proyecto con este contenido:

```env
# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=monterrey_reporta
DB_PORT=3306

# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=mi_secreto_super_seguro_2024
JWT_EXPIRE=7d

# Archivos
MAX_FILE_SIZE=5242880
```

> ⚠️ Si tu MySQL tiene contraseña, escríbela en `DB_PASSWORD=`

---

### 5. Iniciar el servidor

```bash
node server.js
```

O en modo desarrollo (recarga automática):

```bash
npm run dev
```

### 6. Abrir la aplicación

Abre tu navegador en: **http://localhost:3000**

---

## 👤 Usuarios de prueba

El archivo `database.sql` ya incluye dos usuarios listos para usar:

| Rol | Correo | Contraseña |
|-----|--------|------------|
| 🔑 Admin | admin@monterrey.mx | password123 |
| 👤 Ciudadano | juan@example.com | password123 |

---

## 📁 Estructura del proyecto

```
LabProWeb-PIA/
├── config/
│   └── database.js        # Configuración del pool de conexión MySQL
├── controllers/
│   ├── authController.js  # Registro y login
│   ├── reportController.js# CRUD de reportes
│   └── adminController.js # Panel de administración
├── middleware/
│   └── auth.js            # Validación JWT y roles
├── routes/
│   ├── auth.js            # /api/auth
│   ├── reports.js         # /api/reports
│   └── admin.js           # /api/admin
├── public/
│   ├── index.html         # Interfaz web
│   ├── css/style.css
│   └── js/app.js
├── database.sql           # ⬅️ Script de la base de datos
├── server.js              # Punto de entrada del servidor
├── package.json
└── .env                   # ⬅️ Tú lo creas (NO está en Git)
```

---

## 🔌 Endpoints principales de la API

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/auth/register` | Público | Registrar usuario |
| POST | `/api/auth/login` | Público | Iniciar sesión → devuelve JWT |
| POST | `/api/reports` | Autenticado | Crear reporte |
| GET | `/api/reports` | Público | Ver todos los reportes |
| GET | `/api/reports/my` | Autenticado | Ver mis reportes |
| GET | `/api/admin/stats` | Solo admin | Estadísticas del sistema |
| PUT | `/api/admin/reports/:id/status` | Solo admin | Cambiar estado del reporte |
| POST | `/api/admin/reports/:id/evidence` | Solo admin | Subir evidencia de resolución |

---

## ❗ Solución de problemas comunes

**Error: `Cannot connect to MySQL`**  
→ Asegúrate de que MySQL esté corriendo en XAMPP (botón Start en el panel de XAMPP).

**Error: `Unknown database 'monterrey_reporta'`**  
→ No has importado el `database.sql` todavía. Sigue el paso 3.

**Error: `ENOENT: .env`**  
→ Falta el archivo `.env`. Crea uno con el contenido del paso 4.

**La página no carga**  
→ Verifica que el servidor esté corriendo (`node server.js`) y ve a `http://localhost:3000`.

---

## 🛡️ Tecnologías usadas

- **Express** — Framework web
- **mysql2** — Conexión a MySQL con async/await
- **bcryptjs** — Encriptación de contraseñas
- **jsonwebtoken** — Autenticación con JWT
- **multer** — Subida de archivos (evidencias)
- **dotenv** — Variables de entorno

---

*Proyecto PIA — Programación Web | FIME, UANL*
