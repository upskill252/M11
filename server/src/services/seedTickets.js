/**
 * Ticket Seeding Service
 * 
 * Generates realistic ITSM-like sample tickets if the table is empty.
 */

const { getDatabase } = require('../config/database');

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomDays(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedTicketsIfEmpty(totalTickets = 100) {
  const db = getDatabase();
  const { count } = await db.get(`SELECT COUNT(*) AS count FROM tickets`);

  if (count > 0) {
    return { seeded: false, reason: 'Tickets table already populated', existingCount: count };
  }

  console.log('Tickets table empty. Seeding sample ITSM tickets...');

  const STATUSES = ['Open', 'Work in progress', 'Closed'];
  const PRIORITIES = ['1', '2', '3', '4', '5', 'NA'];
  const IMPACTS = ['1', '2', '3', '4', '5', 'NS'];
  const URGENCIES = ['1', '2', '3', '4', '5', 'NS'];
  const CATEGORIES = ['incident','request for information','request for change','complaint'];
  const DESCRIPTIONS = ['application','subapplication','database','network components','hardware','software','computer','storage'];

  let inserted = 0;
  await db.exec('BEGIN TRANSACTION');

  try {
    for (let i = 0; i < totalTickets; i++) {
      const status = pickRandom(STATUSES);
      const createdAt = randomDate(new Date(2013, 0, 1), new Date(2014, 11, 31));
      let resolvedAt = null;
      let closedAt = null;

      if (status === 'Closed') {
        resolvedAt = new Date(createdAt.getTime() + randomDays(0, 14) * 86400000);
        closedAt = new Date(resolvedAt.getTime() + randomDays(0, 7) * 86400000);
      }

      const updatedAt = closedAt || resolvedAt || createdAt;

      await db.run(
        `INSERT INTO tickets (
          title, description, status, priority, category, impact, urgency, created_at, resolved_at, closed_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `SUB${String(i + 1).padStart(6, '0')}`,
          pickRandom(DESCRIPTIONS),
          status,
          pickRandom(PRIORITIES),
          pickRandom(CATEGORIES),
          pickRandom(IMPACTS),
          pickRandom(URGENCIES),
          createdAt.toISOString(),
          resolvedAt ? resolvedAt.toISOString() : null,
          closedAt ? closedAt.toISOString() : null,
          updatedAt.toISOString()
        ]
      );

      inserted++;
    }

    await db.exec('COMMIT');
    return { seeded: true, insertedCount: inserted };

  } catch (error) {
    await db.exec('ROLLBACK');
    console.error('Ticket seeding failed:', error);
    throw error;
  }
}

module.exports = { seedTicketsIfEmpty };