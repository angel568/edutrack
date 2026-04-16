// tests/e2e/app.spec.ts
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

const USUARIOS = {
  admin:      { email: 'admin@edutrack.do',      password: 'Admin123!',      rol: 'admin'      },
  profesor:   { email: 'mrodriguez@edutrack.do', password: 'Profesor123!',   rol: 'profesor'   },
  estudiante: { email: 'jmartinez@edutrack.do',  password: 'Estudiante123!', rol: 'estudiante' },
};

// ── Helper de login ───────────────────────────────────────────
async function login(page: any, usuario: typeof USUARIOS.admin) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', usuario.email);
  await page.fill('input[type="password"]', usuario.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|calificaciones)/);
}

// ══════════════════════════════════════════════════════════════
test.describe('Flujo de Autenticación', () => {
  test('login exitoso como administrador redirige al dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', USUARIOS.admin.email);
    await page.fill('input[type="password"]', USUARIOS.admin.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('login exitoso como estudiante redirige a calificaciones', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', USUARIOS.estudiante.email);
    await page.fill('input[type="password"]', USUARIOS.estudiante.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${BASE_URL}/calificaciones`);
  });

  test('credenciales incorrectas muestra mensaje de error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'noexiste@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="error-msg"], .toast-error, [class*="error"]')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('cerrar sesión redirige al login', async ({ page }) => {
    await login(page, USUARIOS.admin);
    await page.click('button:has-text("Cerrar sesión")');
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('usuario no autenticado es redirigido al login', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('clic en acceso rápido rellena las credenciales', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Administrador")');
    const emailValue = await page.inputValue('input[type="email"]');
    expect(emailValue).toBe(USUARIOS.admin.email);
  });
});

// ══════════════════════════════════════════════════════════════
test.describe('Módulo de Estudiantes', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USUARIOS.admin);
    await page.goto(`${BASE_URL}/estudiantes`);
  });

  test('muestra el listado de estudiantes', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Estudiantes');
    await expect(page.locator('table')).toBeVisible();
  });

  test('abre modal al hacer clic en "Nuevo estudiante"', async ({ page }) => {
    await page.click('button:has-text("Nuevo estudiante")');
    await expect(page.locator('.modal, [class*="modal"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Nuevo estudiante');
  });

  test('crea un nuevo estudiante correctamente', async ({ page }) => {
    await page.click('button:has-text("Nuevo estudiante")');
    await page.fill('input[placeholder*="nombre"], input[name="nombre"]', 'Test');
    await page.fill('input[name="apellido"]', 'Playwright');
    await page.fill('input[name="cedula"]',   '999-9999999-9');
    await page.fill('input[type="email"]',     'test.pw@edutrack.do');
    await page.selectOption('select[name="grado"]', '1ro Bachillerato');
    await page.click('button:has-text("Guardar")');
    await expect(page.locator('.toast-success, [class*="toast"]')).toBeVisible({ timeout: 5000 });
  });

  test('filtra estudiantes por búsqueda', async ({ page }) => {
    await page.fill('input[placeholder*="Buscar"]', 'Juan');
    await page.waitForTimeout(500);
    const filas = page.locator('tbody tr');
    await expect(filas.first()).toBeVisible();
  });

  test('cancela la creación cerrando el modal', async ({ page }) => {
    await page.click('button:has-text("Nuevo estudiante")');
    await page.click('button:has-text("Cancelar")');
    await expect(page.locator('.modal, [class*="modal"]')).not.toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════
test.describe('Módulo de Asistencia', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USUARIOS.admin);
    await page.goto(`${BASE_URL}/asistencia`);
  });

  test('muestra la página de asistencia', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Asistencia');
  });

  test('muestra mensaje de selección cuando no hay materia elegida', async ({ page }) => {
    await expect(page.locator('text=Selecciona una materia')).toBeVisible();
  });

  test('carga lista de estudiantes al seleccionar una materia', async ({ page }) => {
    const select = page.locator('select').first();
    const options = await select.locator('option').count();
    if (options > 1) {
      await select.selectOption({ index: 1 });
      await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    }
  });
});

// ══════════════════════════════════════════════════════════════
test.describe('Módulo de Calificaciones', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USUARIOS.admin);
    await page.goto(`${BASE_URL}/calificaciones`);
  });

  test('muestra la página de calificaciones', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Calificaciones');
  });

  test('botón "Ingresar notas" visible para admin', async ({ page }) => {
    await expect(page.locator('button:has-text("Ingresar notas")')).toBeVisible();
  });

  test('abre modal de ingreso de notas', async ({ page }) => {
    await page.click('button:has-text("Ingresar notas")');
    await expect(page.locator('.modal, [class*="modal"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Ingresar calificaciones');
  });
});

// ══════════════════════════════════════════════════════════════
test.describe('Módulo de Reportes', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USUARIOS.admin);
    await page.goto(`${BASE_URL}/reportes`);
  });

  test('muestra la página de reportes', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Reportes');
  });

  test('muestra los botones de exportación Excel y PDF', async ({ page }) => {
    await expect(page.locator('button:has-text("Exportar Excel")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Exportar PDF")').first()).toBeVisible();
  });

  test('campo de filtro de periodo es visible', async ({ page }) => {
    await expect(page.locator('input[placeholder*="2025"]')).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════
test.describe('Dashboard', () => {
  test('muestra estadísticas correctamente', async ({ page }) => {
    await login(page, USUARIOS.admin);
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Estudiantes activos')).toBeVisible();
    await expect(page.locator('text=Profesores')).toBeVisible();
    await expect(page.locator('text=Materias')).toBeVisible();
  });

  test('estudiante no puede acceder al dashboard', async ({ page }) => {
    await login(page, USUARIOS.estudiante);
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).not.toHaveURL(`${BASE_URL}/dashboard`);
  });
});
