const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products or filter by name/query
router.get('/', async (req, res) => {
    try {
        const { query, name } = req.query;
        let filter = {};
        if (name) {
            filter.name = decodeURIComponent(name);
        } else if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ];
        }
        const products = await Product.find(filter);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

module.exports = router;
