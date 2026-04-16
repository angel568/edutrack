require('dotenv').config();
const { connectDB } = require('../config/db');
const { User, Estudiante, Materia, Asistencia, Calificacion } = require('../models');

const seed = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Iniciando seed...\n');

    // Limpiar tablas en orden correcto (FK)
      const { sequelize } = require('../config/db');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await Calificacion.destroy({ where: {} });
      await Asistencia.destroy({ where: {} });
      await Estudiante.destroy({ where: {} });
      await Materia.destroy({ where: {} });
      await User.destroy({ where: {} });
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🗑️  Tablas limpiadas');

    // ── USUARIOS ──────────────────────────────────────────────────────────────
    const admin = await User.create({
      nombre: 'Admin', apellido: 'Sistema',
      email: 'admin@edutrack.do', password: 'Admin123!', rol: 'admin',
    });
    const prof1 = await User.create({
      nombre: 'María', apellido: 'Rodríguez',
      email: 'mrodriguez@edutrack.do', password: 'Profesor123!', rol: 'profesor',
    });
    const prof2 = await User.create({
      nombre: 'Carlos', apellido: 'Pérez',
      email: 'cperez@edutrack.do', password: 'Profesor123!', rol: 'profesor',
    });
    const estUser = await User.create({
      nombre: 'Juan', apellido: 'Martínez',
      email: 'jmartinez@edutrack.do', password: 'Estudiante123!', rol: 'estudiante',
    });
    console.log('👥 Usuarios creados');

    // ── MATERIAS ──────────────────────────────────────────────────────────────
    const materias = await Materia.bulkCreate([
      { nombre: 'Matemáticas',       codigo: 'MAT101', creditos: 4, grado: '1ro Bachillerato', profesorId: prof1.id },
      { nombre: 'Español',           codigo: 'ESP101', creditos: 4, grado: '1ro Bachillerato', profesorId: prof2.id },
      { nombre: 'Ciencias Naturales',codigo: 'CIE101', creditos: 3, grado: '1ro Bachillerato', profesorId: prof1.id },
      { nombre: 'Inglés',            codigo: 'ING101', creditos: 3, grado: '1ro Bachillerato', profesorId: prof2.id },
      { nombre: 'Historia',          codigo: 'HIS101', creditos: 3, grado: '2do Bachillerato', profesorId: prof1.id },
      { nombre: 'Física',            codigo: 'FIS201', creditos: 4, grado: '2do Bachillerato', profesorId: prof2.id },
    ]);
    console.log('📚 Materias creadas');

    // ── ESTUDIANTES ───────────────────────────────────────────────────────────
    const estudiantes = await Estudiante.bulkCreate([
      { nombre: 'Juan',      apellido: 'Martínez', cedula: '001-0000001-0', email: 'jmartinez@edutrack.do', telefono: '809-555-0001', grado: '1ro Bachillerato', userId: estUser.id },
      { nombre: 'Ana',       apellido: 'Gómez',    cedula: '001-0000002-0', email: 'agomez@edutrack.do',    telefono: '809-555-0002', grado: '1ro Bachillerato' },
      { nombre: 'Pedro',     apellido: 'Sánchez',  cedula: '001-0000003-0', email: 'psanchez@edutrack.do',  telefono: '809-555-0003', grado: '1ro Bachillerato' },
      { nombre: 'Laura',     apellido: 'Fernández',cedula: '001-0000004-0', email: 'lfernandez@edutrack.do',telefono: '809-555-0004', grado: '1ro Bachillerato' },
      { nombre: 'Miguel',    apellido: 'Torres',   cedula: '001-0000005-0', email: 'mtorres@edutrack.do',   telefono: '809-555-0005', grado: '2do Bachillerato' },
      { nombre: 'Sofía',     apellido: 'Reyes',    cedula: '001-0000006-0', email: 'sreyes@edutrack.do',    telefono: '809-555-0006', grado: '2do Bachillerato' },
      { nombre: 'Diego',     apellido: 'Castro',   cedula: '001-0000007-0', email: 'dcastro@edutrack.do',   telefono: '809-555-0007', grado: '1ro Bachillerato' },
      { nombre: 'Valentina', apellido: 'Morales',  cedula: '001-0000008-0', email: 'vmorales@edutrack.do',  telefono: '809-555-0008', grado: '2do Bachillerato' },
    ]);
    console.log('🎓 Estudiantes creados');

    // ── ASISTENCIA (últimos 5 días) ───────────────────────────────────────────
    const estPrimer = estudiantes.filter(e => e.grado === '1ro Bachillerato');
    const estados   = ['presente', 'presente', 'presente', 'tardanza', 'ausente'];
    for (let i = 4; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      for (let j = 0; j < estPrimer.length; j++) {
        await Asistencia.create({
          estudianteId: estPrimer[j].id,
          materiaId:    materias[0].id,
          fecha:        fechaStr,
          estado:       estados[j % estados.length],
          registradoPorId: prof1.id,
        });
      }
    }
    console.log('📋 Asistencia registrada');

    // ── CALIFICACIONES ────────────────────────────────────────────────────────
    const periodo   = '2025-1';
    const notasBase = [[88,92,85,90],[70,65,75,68],[95,98,92,96],[60,58,65,62],[78,82,79,80]];
    for (const mat of materias.slice(0, 4)) {
      for (let i = 0; i < estPrimer.length; i++) {
        const [p1, p2, p3, fn] = notasBase[i % notasBase.length];
        await Calificacion.create({
          estudianteId: estPrimer[i].id,
          materiaId:    mat.id,
          periodo,
          parcial1: p1, parcial2: p2, parcial3: p3, final: fn,
        });
      }
    }
    console.log('📝 Calificaciones creadas');

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📌 Credenciales:');
    console.log('   Admin:      admin@edutrack.do       / Admin123!');
    console.log('   Profesor:   mrodriguez@edutrack.do  / Profesor123!');
    console.log('   Estudiante: jmartinez@edutrack.do   / Estudiante123!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  }
};

seed();
