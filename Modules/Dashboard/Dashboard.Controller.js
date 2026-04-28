const { z } = require('zod');
const Order = require('../Order/order.Model');
const Purchase = require('../Purchase/Purchase.model');
const Inventory = require('../Inventory/inventory.Model');

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const yearQuerySchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(2000, 'Year must be greater than or equal to 2000')
    .max(2100, 'Year must be less than or equal to 2100')
    .optional(),
});

function buildYearRange(year) {
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
  return { start, end };
}

function parseYearFromQuery(req) {
  const parsed = yearQuerySchema.safeParse(req.query || {});
  if (!parsed.success) {
    return {
      ok: false,
      response: {
        success: false,
        message: 'Invalid year query parameter',
        data: parsed.error.flatten(),
      },
    };
  }

  const nowYear = new Date().getUTCFullYear();
  const year = parsed.data.year ?? nowYear;
  return { ok: true, year };
}

function buildMonthlyTotalsBase() {
  return MONTH_LABELS.map((month) => ({ month, total: 0 }));
}

function mapMonthlyTotalRows(rows) {
  const monthly = buildMonthlyTotalsBase();
  (rows || []).forEach((row) => {
    const monthIndex = Number(row._id) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      monthly[monthIndex].total = Number(row.total || 0);
    }
  });
  return monthly;
}

function buildFinanceMonthlyBase() {
  return MONTH_LABELS.map((month) => ({
    month,
    revenue: 0,
    spent: 0,
    profit: 0,
  }));
}

function applyMonthlyValue(monthly, rows, fieldName) {
  (rows || []).forEach((row) => {
    const monthIndex = Number(row._id) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      monthly[monthIndex][fieldName] = Number(row.total || 0);
    }
  });
}

async function getMonthlyPurchases(req, res) {
  try {
    const yearResult = parseYearFromQuery(req);
    if (!yearResult.ok) {
      return res.status(400).json(yearResult.response);
    }

    const { start, end } = buildYearRange(yearResult.year);

    const rows = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthly = mapMonthlyTotalRows(rows);

    return res.status(200).json({
      success: true,
      message: 'Monthly purchases fetched successfully',
      data: monthly,
    });
  } catch (error) {
    console.error('[dashboard.getMonthlyPurchases] error', { message: error.message });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }
}

async function getMonthlyOrders(req, res) {
  try {
    const yearResult = parseYearFromQuery(req);
    if (!yearResult.ok) {
      return res.status(400).json(yearResult.response);
    }

    const { start, end } = buildYearRange(yearResult.year);

    const rows = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthly = mapMonthlyTotalRows(rows);

    return res.status(200).json({
      success: true,
      message: 'Monthly orders fetched successfully',
      data: monthly,
    });
  } catch (error) {
    console.error('[dashboard.getMonthlyOrders] error', { message: error.message });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }
}

async function getTopProducts(req, res) {
  try {
    const topProducts = await Inventory.aggregate([
      { $match: { type: 'OUT' } },
      {
        $group: {
          _id: '$productId',
          totalSold: { $sum: '$quantity' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $project: {
          _id: 0,
          productId: { $toString: '$_id' },
          totalSold: 1,
          productName: {
            $ifNull: [{ $arrayElemAt: ['$product.name', 0] }, 'Unknown product'],
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Top products fetched successfully',
      data: topProducts || [],
    });
  } catch (error) {
    console.error('[dashboard.getTopProducts] error', { message: error.message });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }
}

async function getLowStockProducts(req, res) {
  try {
    const lowStockProducts = await Inventory.aggregate([
      {
        $group: {
          _id: '$productId',
          stock: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$type', 'IN'] }, then: '$quantity' },
                  { case: { $eq: ['$type', 'OUT'] }, then: { $multiply: ['$quantity', -1] } },
                ],
                default: 0,
              },
            },
          },
        },
      },
      { $match: { stock: { $lt: 10 } } },
      { $sort: { stock: 1 } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $project: {
          _id: 0,
          productId: { $toString: '$_id' },
          stock: 1,
          productName: {
            $ifNull: [{ $arrayElemAt: ['$product.name', 0] }, 'Unknown product'],
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Low stock products fetched successfully',
      data: lowStockProducts || [],
    });
  } catch (error) {
    console.error('[dashboard.getLowStockProducts] error', { message: error.message });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }
}

async function getFinanceSummary(req, res) {
  try {
    const yearResult = parseYearFromQuery(req);
    if (!yearResult.ok) {
      return res.status(400).json(yearResult.response);
    }

    const { start, end } = buildYearRange(yearResult.year);
    const dateMatch = { createdAt: { $gte: start, $lte: end } };

    const [revenueAgg, spentAgg, ordersMonthlyAgg, purchasesMonthlyAgg] = await Promise.all([
      Order.aggregate([
        { $match: dateMatch },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Purchase.aggregate([
        { $match: dateMatch },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: dateMatch },
        {
          $group: {
            _id: { $month: '$createdAt' },
            total: { $sum: '$totalAmount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Purchase.aggregate([
        { $match: dateMatch },
        {
          $group: {
            _id: { $month: '$createdAt' },
            total: { $sum: '$totalAmount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalRevenue = Number(revenueAgg?.[0]?.total || 0);
    const totalSpent = Number(spentAgg?.[0]?.total || 0);
    const netProfit = totalRevenue - totalSpent;

    const monthly = buildFinanceMonthlyBase();
    applyMonthlyValue(monthly, ordersMonthlyAgg, 'revenue');
    applyMonthlyValue(monthly, purchasesMonthlyAgg, 'spent');
    monthly.forEach((row) => {
      row.profit = row.revenue - row.spent;
    });

    return res.status(200).json({
      success: true,
      message: 'Finance summary fetched successfully',
      data: {
        totalRevenue,
        totalSpent,
        netProfit,
        monthly,
      },
    });
  } catch (error) {
    console.error('[dashboard.getFinanceSummary] error', { message: error.message });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }
}

module.exports = {
  getMonthlyPurchases,
  getMonthlyOrders,
  getTopProducts,
  getLowStockProducts,
  getFinanceSummary,
};
