const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

const sortProductsLogically = (items) => {
    const getCatRank = (p) => {
        const cat = (p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        if (cat.includes('cookie') || name.includes('cookie')) return 1;
        if (cat.includes('chip') || name.includes('chip')) return 2;
        if (cat.includes('makhana') || name.includes('makhana')) return 3;
        return 4;
    };

    const getProductRankWithinCategory = (p) => {
        const name = (p.name || '').toLowerCase();
        if (name.includes('crunchy pepper')) return 1;
        if (name.includes('himalayan salt')) return 2;
        if (name.includes('peri peri')) return 3;
        if (name.includes('cream') || name.includes('onion') || name.includes('cheese')) return 4;
        if (name.includes('pudina')) return 5;
        return 100;
    };

    return [...items].sort((a, b) => {
        const catA = getCatRank(a);
        const catB = getCatRank(b);
        if (catA !== catB) return catA - catB;

        const rankA = getProductRankWithinCategory(a);
        const rankB = getProductRankWithinCategory(b);
        if (rankA !== rankB) return rankA - rankB;

        return (a.name || '').localeCompare(b.name || '');
    });
};

const { LAUNCH_COMBOS } = require('../config/combos');

// @GET /api/products — public, with filters
router.get('/', async (req, res) => {
    try {
        const { category, search, sort, featured, bestseller, all } = req.query;

        if (featured === 'true') {
            console.log("Executing Prisma query...");
            const products = await Product.findMany({
                where: { isFeatured: true, category: { not: 'Launch Offers' } }
            });
            console.log("Database write successful");
            return res.json(sortProductsLogically(products));
        }

        if (bestseller === 'true') {
            console.log("Executing Prisma query...");
            const products = await Product.findMany({
                where: { isBestSeller: true, category: { not: 'Launch Offers' } }
            });
            console.log("Database write successful");
            return res.json(sortProductsLogically(products));
        }

        const filter = {};
        if (category) {
            filter.category = category;
        } else if (all !== 'true') {
            filter.category = { not: 'Launch Offers' };
        }

        if (search) {
            filter.name = { contains: search, mode: 'insensitive' };
        }

        let orderBy = { createdAt: 'desc' };
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        else if (sort === 'price_desc') orderBy = { price: 'desc' };
        else if (sort === 'rating') orderBy = { ratings: 'desc' };

        console.log("Executing Prisma query...");
        let products = await Product.findMany({
            where: filter,
            orderBy: orderBy
        });
        console.log("Database write successful");

        if (!sort) {
            products = sortProductsLogically(products);
        }

        res.json(products);
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

// @GET /api/products/launch-offers — dedicated launch offers endpoint
router.get('/launch-offers', async (req, res) => {
    try {
        const products = await Product.findMany({
            where: { category: 'Launch Offers' },
            orderBy: { price: 'desc' }
        });
        if (products && products.length > 0) {
            return res.json(products);
        }
        res.json(LAUNCH_COMBOS);
    } catch {
        res.json(LAUNCH_COMBOS);
    }
});

// @GET /api/products/:slug — public
router.get('/:slug', async (req, res) => {
    try {
        console.log("Executing Prisma query...");
        let product = await Product.findUnique({ where: { slug: req.params.slug } });
        console.log("Database write successful");
        if (!product) {
            product = LAUNCH_COMBOS.find(c => c.slug === req.params.slug || c.id === req.params.slug);
        }
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

// @POST /api/products — admin only
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.price !== undefined) data.price = parseFloat(data.price);
        if (data.stock !== undefined) data.stock = parseInt(data.stock, 10);
        if (data.originalPrice !== undefined) data.originalPrice = data.originalPrice ? parseFloat(data.originalPrice) : null;
        if (data.ratings !== undefined) data.ratings = parseFloat(data.ratings);
        if (data.numReviews !== undefined) data.numReviews = parseInt(data.numReviews, 10);
        if (data.isFeatured !== undefined) data.isFeatured = data.isFeatured === 'true' || data.isFeatured === true;
        if (data.isBestSeller !== undefined) data.isBestSeller = data.isBestSeller === 'true' || data.isBestSeller === true;

        console.log("Executing Prisma query...");
        const product = await Product.create({ data });
        console.log("Database write successful");
        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

// @PUT /api/products/:id — admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.price !== undefined) data.price = parseFloat(data.price);
        if (data.stock !== undefined) data.stock = parseInt(data.stock, 10);
        if (data.originalPrice !== undefined) data.originalPrice = data.originalPrice ? parseFloat(data.originalPrice) : null;
        if (data.ratings !== undefined) data.ratings = parseFloat(data.ratings);
        if (data.numReviews !== undefined) data.numReviews = parseInt(data.numReviews, 10);
        if (data.isFeatured !== undefined) data.isFeatured = data.isFeatured === 'true' || data.isFeatured === true;
        if (data.isBestSeller !== undefined) data.isBestSeller = data.isBestSeller === 'true' || data.isBestSeller === true;

        console.log("Executing Prisma query...");
        const product = await Product.update({
            where: { id: req.params.id },
            data: data
        });
        console.log("Database write successful");
        res.json(product);
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

// @DELETE /api/products/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        console.log("Executing Prisma query...");
        await Product.delete({ where: { id: req.params.id } });
        console.log("Database write successful");
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

module.exports = router;

