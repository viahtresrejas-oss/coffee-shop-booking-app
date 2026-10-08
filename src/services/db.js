import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('coffee_booking.db');

const photo = (id, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const SEED_CAFES = [
  {
    name: 'The Daily Grind & Co.',
    category: 'Espresso Bar',
    location: 'Downtown \u2022 0.2 mi',
    rating: 4.9,
    price_range: '\u20b1\u20b1',
    image_url: photo('photo-1554118811-1e0d58224f24', 800),
    seats_available: 12,
  },
  {
    name: 'Fern & Fiddle',
    category: 'Quiet Workspace',
    location: 'Greenwich \u2022 0.8 km',
    rating: 4.6,
    price_range: '\u20b1',
    image_url: photo('photo-1501339847302-ac426a4a7cbb', 800),
    seats_available: 8,
  },
  {
    name: 'Luna Roasters',
    category: 'Late Night',
    location: 'Williamsburg \u2022 1.2 km',
    rating: 4.7,
    price_range: '\u20b1\u20b1',
    image_url: photo('photo-1442512595331-e89e73853f31', 800),
    seats_available: 10,
  },
  {
    name: 'The Roasted Beanery',
    category: 'Espresso Bar',
    location: 'Elmwood \u2022 0.4 mi',
    rating: 4.9,
    price_range: '\u20b1\u20b1',
    image_url: photo('photo-1495474472287-4d71bcdd2085', 800),
    seats_available: 6,
  },
  {
    name: 'Artisan Wood Coffee',
    category: 'Brunch Spot',
    location: 'Elmwood Ave \u2022 0.3 mi',
    rating: 4.8,
    price_range: '\u20b1',
    image_url: photo('photo-1445116572660-236099ec97a0', 800),
    seats_available: 14,
  },
  {
    name: 'Velvet Pour Roastery',
    category: 'Pet Friendly',
    location: 'Market District \u2022 0.6 mi',
    rating: 4.7,
    price_range: '\u20b1\u20b1',
    image_url: photo('photo-1509042239860-f550ce710b93', 800),
    seats_available: 9,
  },
  {
    name: 'Brew & Botanical Cafe',
    category: 'Quiet Workspace',
    location: 'Arts District \u2022 0.5 mi',
    rating: 4.8,
    price_range: '\u20b1',
    image_url: photo('photo-1521017432531-fbd92d768814', 800),
    seats_available: 11,
  },
];

const DEFAULT_PROFILE_ROW = {
  name: 'Maya Lin',
  email: 'maya@example.com',
  phone: '+1 (555) 010-2233',
  avatar_uri:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
};

let dbInitialized = false;

export function initDatabase() {
  if (dbInitialized) return;
  try {
    db.execSync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS cafes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT,
        rating REAL,
        price_range TEXT,
        image_url TEXT,
        seats_available INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cafe_id INTEGER NOT NULL,
        cafe_name TEXT NOT NULL,
        date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        guests INTEGER NOT NULL,
        seating TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        cafe_image TEXT,
        date_label TEXT,
        time_label TEXT,
        seating_label TEXT
      );
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        name TEXT,
        email TEXT,
        phone TEXT,
        avatar_uri TEXT
      );
    `);
    try {
      const cols = db.getAllSync(`PRAGMA table_info(bookings);`);
      const names = new Set((cols ?? []).map((c) => c?.name));
      if (!names.has('cafe_image')) db.execSync(`ALTER TABLE bookings ADD COLUMN cafe_image TEXT;`);
      if (!names.has('date_label')) db.execSync(`ALTER TABLE bookings ADD COLUMN date_label TEXT;`);
      if (!names.has('time_label')) db.execSync(`ALTER TABLE bookings ADD COLUMN time_label TEXT;`);
      if (!names.has('seating_label')) db.execSync(`ALTER TABLE bookings ADD COLUMN seating_label TEXT;`);
    } catch {
      // best-effort migration
    }
    const cafeCount = db.getFirstSync(`SELECT COUNT(*) AS count FROM cafes;`);
    if (!cafeCount || Number(cafeCount.count) === 0) {
      for (const c of SEED_CAFES) {
        db.runSync(
          `INSERT INTO cafes (name, category, location, rating, price_range, image_url, seats_available) VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [c.name, c.category, c.location, c.rating, c.price_range, c.image_url, c.seats_available],
        );
      }
    }
    const profileCount = db.getFirstSync(`SELECT COUNT(*) AS count FROM profile;`);
    if (!profileCount || Number(profileCount.count) === 0) {
      db.runSync(`INSERT INTO profile (id, name, email, phone, avatar_uri) VALUES (1, ?, ?, ?, ?);`, [
        DEFAULT_PROFILE_ROW.name,
        DEFAULT_PROFILE_ROW.email,
        DEFAULT_PROFILE_ROW.phone,
        DEFAULT_PROFILE_ROW.avatar_uri,
      ]);
    }
    dbInitialized = true;
  } catch (e) {
    console.warn('[db] initDatabase failed:', e);
  }
}

function mapCafeRow(row) {
  if (!row || typeof row !== 'object') return null;
  return {
    id: row.id,
    name: row.name ?? 'Cafe',
    category: row.category ?? 'Cafe',
    location: row.location ?? '',
    rating: row.rating ?? 0,
    price_range: row.price_range ?? '',
    price: row.price_range ?? '',
    image_url: row.image_url ?? '',
    image: row.image_url ?? '',
    seats_available: row.seats_available ?? 0,
    distance: row.location ?? '',
    neighborhood: row.location ?? '',
  };
}

function mapBookingRow(row) {
  if (!row || typeof row !== 'object') return null;
  const idStr = String(row.id ?? '');
  return {
    id: idStr,
    _rowId: row.id,
    cafe_id: row.cafe_id,
    cafeId: row.cafe_id != null ? String(row.cafe_id) : '',
    cafe_name: row.cafe_name ?? 'Cafe',
    cafeName: row.cafe_name ?? 'Cafe',
    date: row.date ?? '',
    dateLabel: row.date_label ?? row.date ?? '',
    date_label: row.date_label ?? row.date ?? '',
    time_slot: row.time_slot ?? '',
    timeLabel: row.time_label ?? row.time_slot ?? '',
    time_label: row.time_label ?? row.time_slot ?? '',
    guests: typeof row.guests === 'number' ? row.guests : Number(row.guests ?? 1) || 1,
    seating: row.seating ?? '',
    seatingLabel: row.seating_label ?? row.seating ?? '',
    seating_label: row.seating_label ?? row.seating ?? '',
    status: row.status ?? 'active',
    created_at: row.created_at ?? '',
    cafe_image: row.cafe_image ?? '',
    cafeImage: row.cafe_image ?? '',
  };
}

export function getCafes(query = '', category = 'All') {
  try {
    const q = String(query ?? '').trim();
    const cat = String(category ?? 'All').trim();
    const hasQuery = q.length > 0;
    const hasCategory = cat.length > 0 && cat !== 'All';
    if (hasQuery && hasCategory) {
      const rows = db.getAllSync(
        `SELECT * FROM cafes WHERE name LIKE ? AND category = ? ORDER BY name ASC;`,
        [`%${q}%`, cat],
      );
      return (rows ?? []).map(mapCafeRow).filter(Boolean);
    }
    if (hasQuery) {
      const rows = db.getAllSync(`SELECT * FROM cafes WHERE name LIKE ? ORDER BY name ASC;`, [
        `%${q}%`,
      ]);
      return (rows ?? []).map(mapCafeRow).filter(Boolean);
    }
    if (hasCategory) {
      const rows = db.getAllSync(`SELECT * FROM cafes WHERE category = ? ORDER BY id DESC;`, [cat]);
      return (rows ?? []).map(mapCafeRow).filter(Boolean);
    }
    const rows = db.getAllSync(`SELECT * FROM cafes ORDER BY id DESC;`);
    return (rows ?? []).map(mapCafeRow).filter(Boolean);
  } catch (e) {
    console.warn('[db] getCafes failed:', e);
    return [];
  }
}

export function getCafeById(id) {
  try {
    if (id == null || id === '') return null;
    const row = db.getFirstSync(`SELECT * FROM cafes WHERE id = ?;`, [id]);
    return row ? mapCafeRow(row) : null;
  } catch (e) {
    console.warn('[db] getCafeById failed:', e);
    return null;
  }
}

export function getBookings() {
  try {
    const rows = db.getAllSync(`SELECT * FROM bookings ORDER BY id DESC;`);
    return (rows ?? []).map(mapBookingRow).filter(Boolean);
  } catch (e) {
    console.warn('[db] getBookings failed:', e);
    return [];
  }
}

export function insertBooking(b = {}) {
  try {
    const now = new Date().toISOString();
    const cafeIdNum = Number(b.cafe_id ?? b.cafeId ?? 0);
    const result = db.runSync(
      `INSERT INTO bookings (cafe_id, cafe_name, date, time_slot, guests, seating, status, created_at, cafe_image, date_label, time_label, seating_label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        Number.isFinite(cafeIdNum) ? Math.trunc(cafeIdNum) : 0,
        String(b.cafe_name ?? b.cafeName ?? 'Cafe'),
        String(b.date ?? b.dateLabel ?? 'Thu, 24 Oct'),
        String(b.time_slot ?? b.timeLabel ?? '10:00 AM'),
        Number(b.guests ?? 1) || 1,
        String(b.seating ?? b.seatingLabel ?? 'Indoor'),
        String(b.status ?? 'active'),
        String(b.created_at ?? now),
        String(b.cafe_image ?? b.cafeImage ?? ''),
        String(b.date_label ?? b.dateLabel ?? b.date ?? ''),
        String(b.time_label ?? b.timeLabel ?? b.time_slot ?? ''),
        String(b.seating_label ?? b.seatingLabel ?? b.seating ?? ''),
      ],
    );
    return result?.lastInsertRowId ?? null;
  } catch (e) {
    console.warn('[db] insertBooking failed:', e);
    return null;
  }
}

export function updateBooking(id, fields = {}) {
  try {
    const allowed = {
      date: 'date', dateLabel: 'date', date_label: 'date',
      time_slot: 'time_slot', timeLabel: 'time_slot', time_label: 'time_slot',
      guests: 'guests',
      seating: 'seating', seatingLabel: 'seating', seating_label: 'seating',
      status: 'status',
      cafe_name: 'cafe_name', cafeName: 'cafe_name',
      cafe_image: 'cafe_image', cafeImage: 'cafe_image',
    };
    const sets = [];
    const params = [];
    for (const [key, column] of Object.entries(allowed)) {
      if (fields[key] !== undefined && !sets.some((s) => s.startsWith(column + ' ='))) {
        sets.push(`${column} = ?`);
        params.push(fields[key]);
      }
    }
    if (fields.date !== undefined || fields.dateLabel !== undefined || fields.date_label !== undefined) {
      const v = fields.dateLabel ?? fields.date_label ?? fields.date;
      if (!sets.some((s) => s.startsWith('date_label ='))) { sets.push(`date_label = ?`); params.push(v); }
    }
    if (fields.time_slot !== undefined || fields.timeLabel !== undefined || fields.time_label !== undefined) {
      const v = fields.timeLabel ?? fields.time_label ?? fields.time_slot;
      if (!sets.some((s) => s.startsWith('time_label ='))) { sets.push(`time_label = ?`); params.push(v); }
    }
    if (fields.seating !== undefined || fields.seatingLabel !== undefined || fields.seating_label !== undefined) {
      const v = fields.seatingLabel ?? fields.seating_label ?? fields.seating;
      if (!sets.some((s) => s.startsWith('seating_label ='))) { sets.push(`seating_label = ?`); params.push(v); }
    }
    if (sets.length === 0) return false;
    params.push(id);
    const result = db.runSync(`UPDATE bookings SET ${sets.join(', ')} WHERE id = ?;`, params);
    return Number(result?.changes ?? 0) > 0;
  } catch (e) {
    console.warn('[db] updateBooking failed:', e);
    return false;
  }
}

export function deleteBooking(id) {
  try {
    const result = db.runSync(`DELETE FROM bookings WHERE id = ?;`, [id]);
    return Number(result?.changes ?? 0) > 0;
  } catch (e) {
    console.warn('[db] deleteBooking failed:', e);
    return false;
  }
}

export function getProfile() {
  try {
    const row = db.getFirstSync(`SELECT * FROM profile WHERE id = 1;`);
    if (!row) return null;
    return {
      id: 1,
      name: row.name ?? '',
      email: row.email ?? '',
      phone: row.phone ?? '',
      avatar_uri: row.avatar_uri ?? '',
      photo: row.avatar_uri ?? '',
    };
  } catch (e) {
    console.warn('[db] getProfile failed:', e);
    return null;
  }
}

export function saveProfile(p = {}) {
  try {
    const patch = p && typeof p === 'object' ? p : {};
    const current = getProfile() ?? {};
    const next = {
      name: patch.name !== undefined ? String(patch.name) : String(current.name ?? ''),
      email: patch.email !== undefined ? String(patch.email) : String(current.email ?? ''),
      phone: patch.phone !== undefined ? String(patch.phone) : String(current.phone ?? ''),
      avatar_uri: String(patch.avatar_uri ?? patch.photo ?? current.avatar_uri ?? current.photo ?? ''),
    };
    db.runSync(`UPDATE profile SET name = ?, email = ?, phone = ?, avatar_uri = ? WHERE id = 1;`, [
      next.name, next.email, next.phone, next.avatar_uri,
    ]);
    return { id: 1, ...next, photo: next.avatar_uri };
  } catch (e) {
    console.warn('[db] saveProfile failed:', e);
    return null;
  }
}

// Eagerly initialize at import time: screens and context providers read from
// SQLite during their very first render/effect, which happens BEFORE App.js's
// useEffect. initDatabase() is idempotent, so App.js calling it again is a no-op.
initDatabase();

