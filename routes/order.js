import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import pool from "./db.js"; // PostgreSQL connection pool
import authenticateToken from "./middleware/auth.js"; // JWT middleware

const router = express.Router();
const mongoClient = new MongoClient(process.env.MONGO_URI);
await mongoClient.connect();
const productsCollection = mongoClient.db("farm2customer").collection("products");

// 🛍️ Get all products
router.get("/shop", async (req, res) => {
  try {
    const products = await productsCollection.find({ available: true }).toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// 🛒 Place order (authenticated)
router.post("/order", authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const query = `
      INSERT INTO orders (user_id, product_id, product_name, price, quantity)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [userId, productId, product.name, product.price, quantity];
    const result = await pool.query(query, values);

    res.json({ message: "Order placed successfully", order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Error placing order" });
  }
});

export default router;
