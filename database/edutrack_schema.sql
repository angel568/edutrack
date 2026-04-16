CREATE DATABASE IF NOT EXISTS edutrack
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE edutrack;


--  TABLA: users
CREATE TABLE IF NOT EXISTS users (
  id         INT            NOT NULL AUTO_INCREMENT,
  nombre     VARCHAR(100)   NOT NULL,
  apellido   VARCHAR(100)   NOT NULL,
  email      VARCHAR(150)   NOT NULL,
  password   VARCHAR(255)   NOT NULL,
  rol        ENUM('admin','profesor','estudiante') NOT NULL DEFAULT 'estudiante',
  activo     TINYINT(1)     NOT NULL DEFAULT 1,
  createdAt  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--  TABLA: estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
  id               INT          NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(100) NOT NULL,
  apellido         VARCHAR(100) NOT NULL,
  cedula           VARCHAR(20)  NOT NULL,
  email            VARCHAR(150) NOT NULL,
  telefono         VARCHAR(20)  DEFAULT NULL,
  fechaNacimiento  DATE         DEFAULT NULL,
  grado            VARCHAR(50)  NOT NULL,
  activo           TINYINT(1)   NOT NULL DEFAULT 1,
  userId           INT          DEFAULT NULL,
  createdAt        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_estudiantes_cedula (cedula),
  UNIQUE KEY uq_estudiantes_email  (email),
  CONSTRAINT fk_estudiantes_user
    FOREIGN KEY (userId) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--  TABLA: materias
CREATE TABLE IF NOT EXISTS materias (
  id         INT          NOT NULL AUTO_INCREMENT,
  nombre     VARCHAR(100) NOT NULL,
  codigo     VARCHAR(20)  NOT NULL,
  creditos   INT          NOT NULL,
  grado      VARCHAR(50)  NOT NULL,
  profesorId INT          DEFAULT NULL,
  activa     TINYINT(1)   NOT NULL DEFAULT 1,
  createdAt  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_materias_codigo (codigo),
  CONSTRAINT fk_materias_profesor
    FOREIGN KEY (profesorId) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_materias_creditos CHECK (creditos BETWEEN 1 AND 6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--  TABLA: asistencias
CREATE TABLE IF NOT EXISTS asistencias (
  id               INT  NOT NULL AUTO_INCREMENT,
  estudianteId     INT  NOT NULL,
  materiaId        INT  NOT NULL,
  fecha            DATE NOT NULL,
  estado           ENUM('presente','ausente','tardanza') NOT NULL,
  registradoPorId  INT  NOT NULL,
  createdAt        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_asistencia_por_dia (estudianteId, materiaId, fecha),
  CONSTRAINT fk_asistencias_estudiante
    FOREIGN KEY (estudianteId) REFERENCES estudiantes (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_asistencias_materia
    FOREIGN KEY (materiaId) REFERENCES materias (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_asistencias_registrador
    FOREIGN KEY (registradoPorId) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--  TABLA: calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
  id             INT     NOT NULL AUTO_INCREMENT,
  estudianteId   INT     NOT NULL,
  materiaId      INT     NOT NULL,
  periodo        VARCHAR(10) NOT NULL,
  parcial1       FLOAT   DEFAULT NULL,
  parcial2       FLOAT   DEFAULT NULL,
  parcial3       FLOAT   DEFAULT NULL,
  final          FLOAT   DEFAULT NULL,
  promedio       FLOAT   DEFAULT NULL,
  aprobado       TINYINT(1) DEFAULT NULL,
  periodoAbierto TINYINT(1) NOT NULL DEFAULT 1,
  createdAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_calificacion_periodo (estudianteId, materiaId, periodo),
  CONSTRAINT fk_calificaciones_estudiante
    FOREIGN KEY (estudianteId) REFERENCES estudiantes (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_calificaciones_materia
    FOREIGN KEY (materiaId) REFERENCES materias (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_parcial1 CHECK (parcial1 IS NULL OR parcial1 BETWEEN 0 AND 100),
  CONSTRAINT chk_parcial2 CHECK (parcial2 IS NULL OR parcial2 BETWEEN 0 AND 100),
  CONSTRAINT chk_parcial3 CHECK (parcial3 IS NULL OR parcial3 BETWEEN 0 AND 100),
  CONSTRAINT chk_final    CHECK (final    IS NULL OR final    BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO users (nombre, apellido, email, password, rol, activo) VALUES
('Admin',   'Sistema',    'admin@edutrack.do',       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',      1),
('María',   'Rodríguez',  'mrodriguez@edutrack.do',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'profesor',   1),
('Carlos',  'Pérez',      'cperez@edutrack.do',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'profesor',   1),
('Juan',    'Martínez',   'jmartinez@edutrack.do',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'estudiante', 1);


INSERT INTO materias (nombre, codigo, creditos, grado, profesorId, activa) VALUES
('Matemáticas',        'MAT101', 4, '1ro Bachillerato', 2, 1),
('Español',            'ESP101', 4, '1ro Bachillerato', 3, 1),
('Ciencias Naturales', 'CIE101', 3, '1ro Bachillerato', 2, 1),
('Inglés',             'ING101', 3, '1ro Bachillerato', 3, 1),
('Historia',           'HIS101', 3, '2do Bachillerato', 2, 1),
('Física',             'FIS201', 4, '2do Bachillerato', 3, 1);

INSERT INTO estudiantes (nombre, apellido, cedula, email, telefono, grado, activo, userId) VALUES
('Juan',      'Martínez',  '001-0000001-0', 'jmartinez@edutrack.do',  '809-555-0001', '1ro Bachillerato', 1, 4),
('Ana',       'Gómez',     '001-0000002-0', 'agomez@edutrack.do',     '809-555-0002', '1ro Bachillerato', 1, NULL),
('Pedro',     'Sánchez',   '001-0000003-0', 'psanchez@edutrack.do',   '809-555-0003', '1ro Bachillerato', 1, NULL),
('Laura',     'Fernández', '001-0000004-0', 'lfernandez@edutrack.do', '809-555-0004', '1ro Bachillerato', 1, NULL),
('Miguel',    'Torres',    '001-0000005-0', 'mtorres@edutrack.do',    '809-555-0005', '2do Bachillerato', 1, NULL),
('Sofía',     'Reyes',     '001-0000006-0', 'sreyes@edutrack.do',     '809-555-0006', '2do Bachillerato', 1, NULL),
('Diego',     'Castro',    '001-0000007-0', 'dcastro@edutrack.do',    '809-555-0007', '1ro Bachillerato', 1, NULL),
('Valentina', 'Morales',   '001-0000008-0', 'vmorales@edutrack.do',   '809-555-0008', '2do Bachillerato', 1, NULL);

-- Asistencia últimos 5 días para Matemáticas (materia id=1)
INSERT INTO asistencias (estudianteId, materiaId, fecha, estado, registradoPorId) VALUES
(1, 1, CURDATE() - INTERVAL 4 DAY, 'presente',  2),
(2, 1, CURDATE() - INTERVAL 4 DAY, 'presente',  2),
(3, 1, CURDATE() - INTERVAL 4 DAY, 'presente',  2),
(4, 1, CURDATE() - INTERVAL 4 DAY, 'tardanza',  2),
(1, 1, CURDATE() - INTERVAL 3 DAY, 'presente',  2),
(2, 1, CURDATE() - INTERVAL 3 DAY, 'ausente',   2),
(3, 1, CURDATE() - INTERVAL 3 DAY, 'presente',  2),
(4, 1, CURDATE() - INTERVAL 3 DAY, 'presente',  2),
(1, 1, CURDATE() - INTERVAL 2 DAY, 'presente',  2),
(2, 1, CURDATE() - INTERVAL 2 DAY, 'presente',  2),
(3, 1, CURDATE() - INTERVAL 2 DAY, 'tardanza',  2),
(4, 1, CURDATE() - INTERVAL 2 DAY, 'presente',  2),
(1, 1, CURDATE() - INTERVAL 1 DAY, 'presente',  2),
(2, 1, CURDATE() - INTERVAL 1 DAY, 'presente',  2),
(3, 1, CURDATE() - INTERVAL 1 DAY, 'presente',  2),
(4, 1, CURDATE() - INTERVAL 1 DAY, 'ausente',   2),
(1, 1, CURDATE(),                  'presente',  2),
(2, 1, CURDATE(),                  'presente',  2),
(3, 1, CURDATE(),                  'presente',  2),
(4, 1, CURDATE(),                  'presente',  2);

-- Calificaciones periodo 2025-1 para las 4 materias del 1ro Bachillerato
INSERT INTO calificaciones (estudianteId, materiaId, periodo, parcial1, parcial2, parcial3, final, promedio, aprobado, periodoAbierto) VALUES
-- Matemáticas (1)
(1, 1, '2025-1', 88, 92, 85, 90, 88.75, 1, 1),
(2, 1, '2025-1', 70, 65, 75, 68, 69.50, 1, 1),
(3, 1, '2025-1', 95, 98, 92, 96, 95.25, 1, 1),
(4, 1, '2025-1', 60, 58, 65, 62, 61.25, 1, 1),
-- Español (2)
(1, 2, '2025-1', 78, 82, 79, 80, 79.75, 1, 1),
(2, 2, '2025-1', 88, 92, 85, 90, 88.75, 1, 1),
(3, 2, '2025-1', 70, 65, 75, 68, 69.50, 1, 1),
(4, 2, '2025-1', 95, 98, 92, 96, 95.25, 1, 1),
-- Ciencias Naturales (3)
(1, 3, '2025-1', 60, 58, 65, 62, 61.25, 1, 1),
(2, 3, '2025-1', 78, 82, 79, 80, 79.75, 1, 1),
(3, 3, '2025-1', 88, 92, 85, 90, 88.75, 1, 1),
(4, 3, '2025-1', 70, 65, 75, 68, 69.50, 1, 1),
-- Inglés (4)
(1, 4, '2025-1', 95, 98, 92, 96, 95.25, 1, 1),
(2, 4, '2025-1', 60, 58, 65, 62, 61.25, 1, 1),
(3, 4, '2025-1', 78, 82, 79, 80, 79.75, 1, 1),
(4, 4, '2025-1', 88, 92, 85, 90, 88.75, 1, 1);


--  VERIFICACIÓN FINAL
SELECT 'users'          AS tabla, COUNT(*) AS registros FROM users
UNION ALL
SELECT 'estudiantes',  COUNT(*) FROM estudiantes
UNION ALL
SELECT 'materias',     COUNT(*) FROM materias
UNION ALL
SELECT 'asistencias',  COUNT(*) FROM asistencias
UNION ALL
SELECT 'calificaciones', COUNT(*) FROM calificaciones;
