
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load menu data
const menuPath = path.join(__dirname, 'data', 'menu.json');

function loadMenu() {
  const raw = fs.readFileSync(menuPath, 'utf-8');
  return JSON.parse(raw);
}

// Simple in-memory order store (non-persistent)
const orders = [];

// Routes
app.get('/api/menu', (req, res) => {
  try {
    const menu = loadMenu();
    res.json(menu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load menu' });
  }
});

app.post('/api/order', (req, res) => {
  const { items, customer } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }
  // Validate items quickly
  const menu = loadMenu();
  const flatMenu = Object.values(menu.categories).flat();
  let subtotal = 0;
  const normalized = items.map(it => {
    const menuItem = flatMenu.find(m => m.id === it.id);
    if (!menuItem) return null;
    const qty = Math.max(1, parseInt(it.qty || 1, 10));
    const size = it.size && menuItem.sizes?.[it.size] ? it.size : (menuItem.defaultSize || null);
    const unitPrice = size ? menuItem.sizes[size] : menuItem.price;
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;
    return {
      id: menuItem.id,
      name: menuItem.name,
      qty,
      size,
      unitPrice,
      lineTotal
    };
  }).filter(Boolean);

  if (normalized.length === 0) {
    return res.status(400).json({ error: 'Selected items are invalid.' });
  }

  const taxes = +(subtotal * 0.05).toFixed(2);
  const delivery = subtotal >= 25 ? 0 : 2.5;
  const total = +(subtotal + taxes + delivery).toFixed(2);

  const order = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    items: normalized,
    customer: {
      name: customer?.name || 'Guest',
      phone: customer?.phone || '',
      address: customer?.address || '',
      notes: customer?.notes || ''
    },
    amounts: { subtotal: +subtotal.toFixed(2), taxes, delivery, total },
    status: 'received'
  };
  orders.push(order);
  return res.json({ ok: true, order });
});

app.get('/api/order/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  return res.json(order);
});

app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Serve SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MasalaMeal server running on http://localhost:${PORT}`);
});
