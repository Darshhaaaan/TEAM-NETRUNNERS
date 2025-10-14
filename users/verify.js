const express = require("express")
const { Pool } = require('pg');
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const crypt = require("bcrypt");
const router = express.Router();

dotenv.config();

const pool = require('../db');

router.get('/verify', (req, res) => {
    const token = req.query.sign;
    if(!token) return res.status(400).json({error: "Token is missing"});
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) return res.status(400).json({error: "Invalid token"})

      pool.query('UPDATE users SET verified = true WHERE email = $1', [decoded.email], (err, result) => {
        if(err) return res.status(500).json({error: "Database error"});
        if(result.rowcount === 0) return res.status(404).json({error: "User not found/ already verifed"});
      })
    });
    return res.status(200).json({message: "Account verified"});
});

module.exports = router;