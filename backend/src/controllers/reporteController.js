const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Estudiante, Calificacion, Asistencia, Materia } = require('../models');

// GET /api/reportes/calificaciones/excel
const exportCalificacionesExcel = async (req, res, next) => {
  try {
    const { periodo, materiaId } = req.query;
    const where = {};
    if (periodo)   where.periodo   = periodo;
    if (materiaId) where.materiaId = materiaId;

    const calificaciones = await Calificacion.findAll({
      where,
      include: [
        { model: Estudiante, as: 'estudiante', attributes: ['nombre', 'apellido', 'cedula', 'grado'] },
        { model: Materia,    as: 'materia',    attributes: ['nombre', 'codigo'] },
      ],
      order: [['periodo', 'DESC']],
    });

    const workbook  = new ExcelJS.Workbook();
    workbook.creator = 'EduTrack';
    const sheet = workbook.addWorksheet('Calificaciones');

    // Estilos
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A56DB' } };
    const headerFont = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };

    sheet.columns = [
      { header: 'Estudiante',  key: 'estudiante', width: 25 },
      { header: 'Cédula',      key: 'cedula',     width: 18 },
      { header: 'Grado',       key: 'grado',      width: 18 },
      { header: 'Materia',     key: 'materia',    width: 25 },
      { header: 'Periodo',     key: 'periodo',    width: 12 },
      { header: 'Parcial 1',   key: 'parcial1',   width: 12 },
      { header: 'Parcial 2',   key: 'parcial2',   width: 12 },
      { header: 'Parcial 3',   key: 'parcial3',   width: 12 },
      { header: 'Final',       key: 'final',      width: 12 },
      { header: 'Promedio',    key: 'promedio',   width: 12 },
      { header: 'Estado',      key: 'estado',     width: 12 },
    ];

    sheet.getRow(1).eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    sheet.getRow(1).height = 28;

    calificaciones.forEach((c, i) => {
      const row = sheet.addRow({
        estudiante: `${c.estudiante.nombre} ${c.estudiante.apellido}`,
        cedula:     c.estudiante.cedula,
        grado:      c.estudiante.grado,
        materia:    c.materia.nombre,
        periodo:    c.periodo,
        parcial1:   c.parcial1 ?? '-',
        parcial2:   c.parcial2 ?? '-',
        parcial3:   c.parcial3 ?? '-',
        final:      c.final    ?? '-',
        promedio:   c.promedio ?? '-',
        estado:     c.aprobado ? 'Aprobado' : 'Reprobado',
      });

      const estadoCell = row.getCell('estado');
      estadoCell.font = { bold: true, color: { argb: c.aprobado ? 'FF166534' : 'FF991B1B' } };
      estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.aprobado ? 'FFDCFCE7' : 'FFFEE2E2' } };

      if (i % 2 === 1) {
        row.eachCell(cell => {
          if (!cell.fill?.fgColor?.argb || cell.fill.fgColor.argb === 'FFFFFFFF') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          }
        });
      }
    });

    // Título del reporte
    sheet.spliceRows(1, 0, ['', '', '', '', '', '', '', '', '', '', '']);
    sheet.mergeCells('A1:K1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `EduTrack — Reporte de Calificaciones${periodo ? ' · Periodo ' + periodo : ''}`;
    titleCell.font  = { bold: true, size: 13, color: { argb: 'FF1E293B' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
    sheet.getRow(1).height = 32;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=calificaciones_${periodo || 'todos'}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { next(err); }
};

// GET /api/reportes/asistencia/excel
const exportAsistenciaExcel = async (req, res, next) => {
  try {
    const { materiaId, fechaInicio, fechaFin } = req.query;
    const { Op } = require('sequelize');
    const where = {};
    if (materiaId) where.materiaId = materiaId;
    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha[Op.gte] = fechaInicio;
      if (fechaFin)    where.fecha[Op.lte] = fechaFin;
    }

    const asistencias = await Asistencia.findAll({
      where,
      include: [
        { model: Estudiante, as: 'estudiante', attributes: ['nombre', 'apellido', 'cedula', 'grado'] },
        { model: Materia,    as: 'materia',    attributes: ['nombre', 'codigo'] },
      ],
      order: [['fecha', 'DESC']],
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Asistencia');
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A56DB' } };
    const headerFont = { color: { argb: 'FFFFFFFF' }, bold: true };

    sheet.columns = [
      { header: 'Fecha',       key: 'fecha',      width: 14 },
      { header: 'Estudiante',  key: 'estudiante', width: 25 },
      { header: 'Cédula',      key: 'cedula',     width: 18 },
      { header: 'Grado',       key: 'grado',      width: 18 },
      { header: 'Materia',     key: 'materia',    width: 25 },
      { header: 'Estado',      key: 'estado',     width: 14 },
    ];

    sheet.getRow(1).eachCell(cell => { cell.fill = headerFill; cell.font = headerFont; cell.alignment = { horizontal: 'center' }; });

    const estadoColor = { presente: { bg: 'FFDCFCE7', fg: 'FF166534' }, ausente: { bg: 'FFFEE2E2', fg: 'FF991B1B' }, tardanza: { bg: 'FFFEF3C7', fg: 'FF92400E' } };

    asistencias.forEach(a => {
      const row = sheet.addRow({
        fecha:      a.fecha,
        estudiante: `${a.estudiante.nombre} ${a.estudiante.apellido}`,
        cedula:     a.estudiante.cedula,
        grado:      a.estudiante.grado,
        materia:    a.materia.nombre,
        estado:     a.estado.charAt(0).toUpperCase() + a.estado.slice(1),
      });
      const { bg, fg } = estadoColor[a.estado] || { bg: 'FFFFFFFF', fg: 'FF000000' };
      row.getCell('estado').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      row.getCell('estado').font = { bold: true, color: { argb: fg } };
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=asistencia.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { next(err); }
};

// GET /api/reportes/calificaciones/pdf
const exportCalificacionesPDF = async (req, res, next) => {
  try {
    const { periodo, materiaId } = req.query;
    const where = {};
    if (periodo)   where.periodo   = periodo;
    if (materiaId) where.materiaId = materiaId;

    const calificaciones = await Calificacion.findAll({
      where,
      include: [
        { model: Estudiante, as: 'estudiante', attributes: ['nombre', 'apellido', 'cedula', 'grado'] },
        { model: Materia,    as: 'materia',    attributes: ['nombre', 'codigo'] },
      ],
      order: [['periodo', 'DESC'], ['estudiante', 'apellido', 'ASC']],
    });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=calificaciones_${periodo || 'todos'}.pdf`);
    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 70).fill('#1A56DB');
    doc.fill('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('EduTrack', 40, 20);
    doc.fontSize(11).font('Helvetica').text(`Reporte de Calificaciones${periodo ? ' — Periodo ' + periodo : ''}`, 40, 45);
    doc.fill('#000000').moveDown(2);

    // Fecha
    doc.fontSize(9).fill('#64748B').text(`Generado: ${new Date().toLocaleDateString('es-DO', { dateStyle: 'long' })}`, { align: 'right' });
    doc.moveDown();

    // Tabla
    const cols = { est: 40, ced: 190, mat: 290, p1: 370, p2: 405, p3: 440, prom: 478, est2: 520 };
    const rowH = 22;
    let y = doc.y + 10;

    // Header tabla
    doc.rect(40, y, 515, rowH).fill('#1E293B');
    doc.fill('#FFFFFF').fontSize(8).font('Helvetica-Bold');
    doc.text('Estudiante',  cols.est, y + 7);
    doc.text('Cédula',      cols.ced, y + 7);
    doc.text('Materia',     cols.mat, y + 7);
    doc.text('P1',          cols.p1,  y + 7);
    doc.text('P2',          cols.p2,  y + 7);
    doc.text('P3',          cols.p3,  y + 7);
    doc.text('Prom',        cols.prom, y + 7);
    doc.text('Estado',      cols.est2, y + 7);
    y += rowH;

    calificaciones.forEach((c, i) => {
      if (y > doc.page.height - 60) { doc.addPage(); y = 40; }
      const bg = i % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
      doc.rect(40, y, 515, rowH).fill(bg);
      doc.fill('#1E293B').fontSize(8).font('Helvetica');
      doc.text(`${c.estudiante.apellido}, ${c.estudiante.nombre}`, cols.est, y + 7, { width: 145 });
      doc.text(c.estudiante.cedula, cols.ced, y + 7, { width: 95 });
      doc.text(c.materia.nombre,    cols.mat, y + 7, { width: 75 });
      doc.text(c.parcial1 ?? '-',   cols.p1,  y + 7, { width: 30 });
      doc.text(c.parcial2 ?? '-',   cols.p2,  y + 7, { width: 30 });
      doc.text(c.parcial3 ?? '-',   cols.p3,  y + 7, { width: 30 });
      doc.text(c.promedio ?? '-',   cols.prom, y + 7, { width: 35 });

      const estadoColor = c.aprobado ? '#166534' : '#991B1B';
      const estadoBg    = c.aprobado ? '#DCFCE7' : '#FEE2E2';
      doc.rect(cols.est2, y + 4, 50, 14).fill(estadoBg);
      doc.fill(estadoColor).font('Helvetica-Bold').text(c.aprobado ? 'Aprobado' : 'Reprobado', cols.est2 + 2, y + 7, { width: 48 });
      y += rowH;
    });

    // Footer
    doc.rect(0, doc.page.height - 30, doc.page.width, 30).fill('#F1F5F9');
    doc.fill('#94A3B8').fontSize(8).text('EduTrack — Sistema de Gestión Escolar', 40, doc.page.height - 18);
    doc.text(`Total: ${calificaciones.length} registros`, 0, doc.page.height - 18, { align: 'right', width: doc.page.width - 40 });

    doc.end();
  } catch (err) { next(err); }
};

module.exports = { exportCalificacionesExcel, exportAsistenciaExcel, exportCalificacionesPDF };
