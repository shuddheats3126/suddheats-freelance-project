const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { LAUNCH_COMBOS } = require('../config/combos');

const router = express.Router();

// Helper to populate products in cart items
const populateCartItems = async (cart) => {
    if (!cart) return null;
    const items = Array.isArray(cart.items) ? cart.items : [];
    if (items.length === 0) return { ...cart, items: [] };

    const productIds = items.map(item => item.product).filter(Boolean);
    const products = await Product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, price: true, thumbnail: true, slug: true, stock: true }
    });

    const productMap = new Map(products.map(p => [p.id, p]));
    // Also include LAUNCH_COMBOS in productMap if any item.product matches
    for (const combo of LAUNCH_COMBOS) {
        if (!productMap.has(combo.id)) {
            productMap.set(combo.id, combo);
        }
    }

    const populatedItems = items.map(item => ({
        ...item,
        product: productMap.get(item.product) || null
    }));

    return {
        ...cart,
        items: populatedItems
    };
};

// @GET /api/cart — get user cart
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findUnique({ where: { userId: req.user.id } });
        if (!cart) {
            return res.json({ items: [] });
        }
        const populatedCart = await populateCartItems(cart);
        res.json(populatedCart);
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

// @POST /api/cart — add item or update qty
router.post('/', protect, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        let product = await Product.findUnique({ where: { id: productId } });
        
        if (!product) {
            // Check if it matches a combo by ID or slug
            const foundCombo = LAUNCH_COMBOS.find(c => c.id === productId || c.slug === productId);
            if (foundCombo) {
                try {
                    product = await Product.upsert({
                        where: { slug: foundCombo.slug },
                        update: {},
                        create: {
                            name: foundCombo.name,
                            slug: foundCombo.slug,
                            description: foundCombo.description,
                            shortDescription: foundCombo.badge,
                            price: foundCombo.price,
                            originalPrice: foundCombo.originalPrice,
                            category: foundCombo.category,
                            thumbnail: foundCombo.thumbnail,
                            images: foundCombo.images,
                            stock: foundCombo.stock,
                            weight: foundCombo.weight,
                            isFeatured: false,
                            isBestSeller: false
                        }
                    });
                } catch (dbErr) {
                    console.warn('Could not auto-create combo in DB, using static fallback:', dbErr.message);
                    product = foundCombo;
                }
            }
        }

        if (!product) return res.status(404).json({ message: 'Product not found' });

        let cart = await Cart.findUnique({ where: { userId: req.user.id } });
        if (!cart) {
            console.log("Executing Prisma query...");
            cart = await Cart.create({
                data: { userId: req.user.id, items: [] }
            });
            console.log("Database write successful");
        }

        const items = Array.isArray(cart.items) ? cart.items : [];
        const itemIndex = items.findIndex(i => i.product === productId);

        if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

        if (itemIndex > -1) {
            items[itemIndex].quantity = quantity;
        } else {
            items.push({
                product: productId,
                name: product.name,
                image: product.thumbnail,
                price: product.price,
                quantity,
                weight: null,
                packaging: null
            });
        }

        console.log("Executing Prisma query...");
        const updatedCart = await Cart.update({
            where: { id: cart.id },
            data: { items }
        });
        console.log("Database write successful");

        const populatedCart = await populateCartItems(updatedCart);
        res.json(populatedCart);
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

// @POST /api/cart/update-options — update options of an item
router.post('/update-options', protect, async (req, res) => {
    try {
        const { productId, weight, packaging, price } = req.body;
        let cart = await Cart.findUnique({ where: { userId: req.user.id } });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const items = Array.isArray(cart.items) ? cart.items : [];
        const itemIndex = items.findIndex(i => i.product === productId);
        if (itemIndex > -1) {
            items[itemIndex].weight = weight;
            items[itemIndex].packaging = packaging;
            items[itemIndex].price = price;
            
            console.log("Executing Prisma query...");
            const updatedCart = await Cart.update({
                where: { id: cart.id },
                data: { items }
            });
            console.log("Database write successful");

            const populatedCart = await populateCartItems(updatedCart);
            return res.json(populatedCart);
        }
        
        res.status(404).json({ message: 'Item not found in cart' });
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

// @DELETE /api/cart/:productId — remove item
router.delete('/:productId', protect, async (req, res) => {
    try {
        const cart = await Cart.findUnique({ where: { userId: req.user.id } });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const items = Array.isArray(cart.items) ? cart.items : [];
        const filteredItems = items.filter(i => i.product !== req.params.productId);

        console.log("Executing Prisma query...");
        const updatedCart = await Cart.update({
            where: { id: cart.id },
            data: { items: filteredItems }
        });
        console.log("Database write successful");

        const populatedCart = await populateCartItems(updatedCart);
        res.json(populatedCart);
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

// @DELETE /api/cart — clear entire cart
router.delete('/', protect, async (req, res) => {
    try {
        console.log("Executing Prisma query...");
        await Cart.upsert({
            where: { userId: req.user.id },
            update: { items: [] },
            create: { userId: req.user.id, items: [] }
        });
        console.log("Database write successful");
        res.json({ message: 'Cart cleared' });
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

