const db = require('../config/db');

const createPlan = async (req, res) => {
  const { plan_name, plan_type, meals_per_day, price_per_month, price_per_meal } = req.body;

  if (!plan_name || !plan_type) {
    return res.status(400).json({ message: 'Plan name and type are required' });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO mess_plans
      (plan_name, plan_type, meals_per_day, price_per_month, price_per_meal, is_active)
      VALUES (?, ?, ?, ?, ?, true)`,
      [plan_name, plan_type, meals_per_day || null, price_per_month || null, price_per_meal || null]
    );

    res.status(201).json({ message: 'Mess plan created successfully', planId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPlans = async (_req, res) => {
  try {
    const [plans] = await db.execute('SELECT * FROM mess_plans WHERE is_active = true ORDER BY id DESC');
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTodayStats = async (_req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT meal_type, COUNT(*) AS count
       FROM mess_daily_logs
       WHERE meal_date = CURDATE()
       GROUP BY meal_type`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const subscribeToMess = async (req, res) => {
  const { mess_plan_id } = req.body;
  const userId = req.user.id;

  if (!mess_plan_id) {
    return res.status(400).json({ message: 'Mess plan ID required' });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [existing] = await conn.execute(
      `SELECT id FROM mess_subscriptions
       WHERE user_id = ? AND subscription_status = 'ACTIVE'`,
      [userId]
    );

    if (existing.length > 0) {
      throw new Error('Already subscribed');
    }

    const [plan] = await conn.execute(
      `SELECT * FROM mess_plans
       WHERE id = ? AND is_active = true`,
      [mess_plan_id]
    );

    if (plan.length === 0) {
      throw new Error('Invalid mess plan');
    }

    const [booking] = await conn.execute(
      `SELECT id FROM bookings
       WHERE user_id = ?
       ORDER BY id DESC LIMIT 1`,
      [userId]
    );

    if (booking.length === 0) {
      throw new Error('Please create a room booking first.');
    }

    const selectedPlan = plan[0];
    const totalAmount = selectedPlan.plan_type === 'PAY_PER_MEAL'
      ? 0
      : Number(selectedPlan.price_per_month || 0);

    await conn.execute(
      `INSERT INTO mess_subscriptions
      (user_id, mess_plan_id, booking_id, start_date, end_date,
       subscription_status, total_amount, paid_amount, payment_status)
      VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY),
      'ACTIVE', ?, 0, 'PENDING')`,
      [userId, mess_plan_id, booking[0].id, totalAmount]
    );

    await conn.commit();
    res.json({
      message: selectedPlan.plan_type === 'PAY_PER_MEAL'
        ? 'Pay-per-meal plan activated'
        : 'Mess subscription activated',
    });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};

const logMeal = async (req, res) => {
  const { meal_type } = req.body;
  const userId = req.user.id;

  if (!meal_type) {
    return res.status(400).json({ message: 'Meal type required' });
  }

  try {
    const [booking] = await db.execute(
      `SELECT id FROM bookings
       WHERE user_id = ?
       ORDER BY id DESC LIMIT 1`,
      [userId]
    );

    const bookingId = booking.length > 0 ? booking[0].id : null;

    const [sub] = await db.execute(
      `SELECT ms.mess_plan_id, mp.price_per_meal
       FROM mess_subscriptions ms
       JOIN mess_plans mp ON ms.mess_plan_id = mp.id
       WHERE ms.user_id = ?
         AND ms.subscription_status = 'ACTIVE'
         AND mp.plan_type = 'PAY_PER_MEAL'
       LIMIT 1`,
      [userId]
    );

    if (sub.length === 0) {
      return res.status(403).json({ message: 'No active pay-per-meal plan' });
    }

    await db.execute(
      `INSERT INTO mess_daily_logs
      (user_id, meal_date, meal_type, mess_plan_id, booking_id, meal_price)
      VALUES (?, CURDATE(), ?, ?, ?, ?)`,
      [userId, meal_type, sub[0].mess_plan_id, bookingId, sub[0].price_per_meal]
    );

    res.json({ message: 'Meal logged successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Meal already logged for this type today' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyMess = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.execute(
      `SELECT ms.*, mp.plan_name, mp.plan_type
       FROM mess_subscriptions ms
       JOIN mess_plans mp ON ms.mess_plan_id = mp.id
       WHERE ms.user_id = ?
         AND ms.subscription_status = 'ACTIVE'
       ORDER BY ms.id DESC
       LIMIT 1`,
      [userId]
    );

    res.json({ activeSubscription: rows.length ? rows[0] : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPlan,
  getPlans,
  getTodayStats,
  subscribeToMess,
  logMeal,
  getMyMess,
};
