const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();
const pool = require("../db");

router.post("/register", async (req, res) => {
  const { farm_name, phone, about, password } = req.body;

  if (!farm_name || !phone || !password)
    return res.status(400).json({ error: "Farm name and phone and password are required" });

  try {
    const checkUser = await pool.query("SELECT * FROM farmer_profiles WHERE phone = $1", [phone]);
    if (checkUser.rows.length > 0)
      return res.status(400).json({ error: "Phone number already registered" });

    const insertFarmer = await pool.query(
      "INSERT INTO farmer_profiles (farm_name, phone, about, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [farm_name, phone, about || null, password]
    );

    return res.json({ message: "Farmer registered successfully." });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: "Phone and password are required" });

  try {
    const result = await pool.query("SELECT * FROM farmer_profiles WHERE phone = $1 AND password = $2", [phone, password]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Farmer not found" });

    const farmer = result.rows[0];

    const token = jwt.sign({ id: farmer.id, phone }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/edit", async (req, res) => {
  const { id, farm_name, about } = req.body;
  if (!id) return res.status(400).json({ error: "Farmer ID is required" });

  try {
    await pool.query("UPDATE farmer_profiles SET farm_name = $1, about = $2 WHERE id = $3", [
      farm_name,
      about,
      id,
    ]);

    return res.json({ message: "Farmer details updated successfully" });
  } catch (err) {
    console.error("Edit error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
