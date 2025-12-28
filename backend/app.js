require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { authMiddleware } = require('./middleware/auth');
const { claimsRouter } = require('./routes/claims');
const { approvalsRouter } = require('./routes/approvals');
const { dashboardsRouter } = require('./routes/dashboards');

const app = express();

// Core middleware wiring (no business logic)
app.use(cors()); // Allow all origins for demo
app.use(express.json());
app.use(authMiddleware);
app.use(claimsRouter);
app.use(approvalsRouter);
app.use(dashboardsRouter);

// Health endpoint only
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Reimbursement Accountability System' });
});

// App initialization
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app };