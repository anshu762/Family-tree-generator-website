import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Ensure spouses table exists
const ensureSpousesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS family_spouses (
        id SERIAL PRIMARY KEY,
        tree_id INTEGER NOT NULL REFERENCES family_trees(id) ON DELETE CASCADE,
        member1_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
        member2_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_spouse_pair') THEN
          ALTER TABLE family_spouses ADD CONSTRAINT unique_spouse_pair UNIQUE (member1_id, member2_id);
        END IF;
      END $$;
    `);
  } catch (e) {
    console.log('spouses table check:', e.message);
  }
};
ensureSpousesTable();

const cleanDate = (v) => (!v || v === '' ? null : v);
const cleanId = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};
const cleanStr = (v) => (!v || v === '' ? null : v);

// GET members
router.get('/:treeId', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM family_members WHERE tree_id = $1 ORDER BY created_at',
      [req.params.treeId]
    );
    res.json(rows);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET spouses
router.get('/spouses/:treeId', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM family_spouses WHERE tree_id = $1 ORDER BY created_at',
      [req.params.treeId]
    );
    res.json(rows);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST spouse link
router.post('/spouses', auth, async (req, res) => {
  try {
    let { tree_id, member1_id, member2_id } = req.body;
    tree_id = cleanId(tree_id);
    member1_id = cleanId(member1_id);
    member2_id = cleanId(member2_id);
    if (!tree_id || !member1_id || !member2_id) throw new Error('Missing fields');
    if (member1_id === member2_id) throw new Error('Cannot link self as spouse');
    const m1 = Math.min(member1_id, member2_id);
    const m2 = Math.max(member1_id, member2_id);
    const { rows: existing } = await pool.query(
      'SELECT * FROM family_spouses WHERE member1_id=$1 AND member2_id=$2',
      [m1, m2]
    );
    if (existing.length) return res.json(existing[0]);
    const { rows } = await pool.query(
      'INSERT INTO family_spouses (tree_id, member1_id, member2_id) VALUES ($1,$2,$3) RETURNING *',
      [tree_id, m1, m2]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/spouses/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM family_spouses WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST member - FIXED DATE BUG
router.post('/', auth, async (req, res) => {
  try {
    let { tree_id, name, gender, birth_date, death_date, photo_url, bio, father_id, mother_id } = req.body;
    birth_date = cleanDate(birth_date);
    death_date = cleanDate(death_date);
    father_id = cleanId(father_id);
    mother_id = cleanId(mother_id);
    photo_url = cleanStr(photo_url);
    bio = cleanStr(bio);
    const { rows } = await pool.query(
      `INSERT INTO family_members 
       (tree_id, name, gender, birth_date, death_date, photo_url, bio, father_id, mother_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [tree_id, name, gender, birth_date, death_date, photo_url, bio, father_id, mother_id]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    let { name, gender, birth_date, death_date, photo_url, bio, father_id, mother_id } = req.body;
    birth_date = cleanDate(birth_date);
    death_date = cleanDate(death_date);
    father_id = cleanId(father_id);
    mother_id = cleanId(mother_id);
    photo_url = cleanStr(photo_url);
    bio = cleanStr(bio);
    const { rows } = await pool.query(
      `UPDATE family_members 
       SET name=$1, gender=$2, birth_date=$3, death_date=$4, photo_url=$5, bio=$6, father_id=$7, mother_id=$8 
       WHERE id=$9 RETURNING *`,
      [name, gender, birth_date, death_date, photo_url, bio, father_id, mother_id, req.params.id]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM family_members WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;





















// import express from 'express';
// import jwt from 'jsonwebtoken';
// import { pool } from '../db.js';

// const router = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// const auth = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'Missing token' });
//   try {
//     req.user = jwt.verify(token, JWT_SECRET);
//     next();
//   } catch {
//     res.status(401).json({ error: 'Invalid token' });
//   }
// };

// router.post('/', auth, async (req, res) => {
//   try {
//     const { tree_id, name, gender, birth_date, death_date, photo_url, bio, father_id, mother_id } = req.body;
//     const { rows } = await pool.query(
//       `INSERT INTO family_members 
//        (tree_id, name, gender, birth_date, death_date, photo_url, bio, father_id, mother_id) 
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
//       [tree_id, name, gender, birth_date, death_date, photo_url, bio, father_id, mother_id]
//     );
//     res.json(rows[0]);
//   } catch (e) {
//     res.status(400).json({ error: e.message });
//   }
// });

// router.get('/:treeId', auth, async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       'SELECT * FROM family_members WHERE tree_id = $1 ORDER BY created_at',
//       [req.params.treeId]
//     );
//     res.json(rows);
//   } catch (e) {
//     res.status(400).json({ error: e.message });
//   }
// });

// router.put('/:id', auth, async (req, res) => {
//   try {
//     const { name, gender, birth_date, death_date, photo_url, bio, father_id, mother_id } = req.body;
//     const { rows } = await pool.query(
//       `UPDATE family_members 
//        SET name=$1, gender=$2, birth_date=$3, death_date=$4, photo_url=$5, bio=$6, father_id=$7, mother_id=$8 
//        WHERE id=$9 RETURNING *`,
//       [name, gender, birth_date, death_date, photo_url, bio, father_id, mother_id, req.params.id]
//     );
//     res.json(rows[0]);
//   } catch (e) {
//     res.status(400).json({ error: e.message });
//   }
// });

// router.delete('/:id', auth, async (req, res) => {
//   try {
//     await pool.query('DELETE FROM family_members WHERE id = $1', [req.params.id]);
//     res.json({ success: true });
//   } catch (e) {
//     res.status(400).json({ error: e.message });
//   }
// });

// export default router;