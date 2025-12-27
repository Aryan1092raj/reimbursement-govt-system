const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Reimbursement Accountability System' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});