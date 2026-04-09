const express = require('express');
const router = express.Router();

// In-memory store
const products = [];
let nextId = 1;

// GET /products
router.get('/', (req, res) => {
  req.log.info({ count: products.length }, 'Listing products');
  res.json(products);
});

// POST /products
router.post('/', (req, res) => {
  const { name, price, description } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'name and price are required' });
  }

  const product = { id: nextId++, name, price, description: description || '' };
  products.push(product);

  req.log.info({ product }, 'Product created');
  res.status(201).json(product);
});

// PUT /products/:id
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    req.log.warn({ id }, 'Product not found for update');
    return res.status(404).json({ error: 'Product not found' });
  }

  const { name, price, description } = req.body;
  products[index] = { ...products[index], name, price, description };

  req.log.info({ product: products[index] }, 'Product updated');
  res.json(products[index]);
});

// DELETE /products/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    req.log.warn({ id }, 'Product not found for deletion');
    return res.status(404).json({ error: 'Product not found' });
  }

  const [removed] = products.splice(index, 1);
  req.log.info({ product: removed }, 'Product deleted');
  res.status(204).send();
});

module.exports = router;
