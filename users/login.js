const express = require("express")
const { Pool } = require('pg');
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const crypt = require("bcrypt");
const validator = require("validator");
const router = express.Router();
const emailFunc = require("./mailer");

dotenv.config();

const pool = require('../db');

router.post('/register', (req,res) => {
    const {name, userEmail, phone, password} = req.body;
    
    //write frontend for this
    if(!name || !userEmail || !phone || !password) return res.status(400).json({error: "name or email or password is empty"})

    const email = userEmail.trim().toLowerCase();

    pool.query('SELECT * FROM users WHERE email = $1 OR number = $2', [email, phone], (err, results) => {
        if(err) return res.status(500).json({error: console.log(err)});
        if(results.rows.length > 0) {
            for(let i = 0; i < results.rows.length; i++) {
                const user = results.rows[i];

                if(user.email === email) {
                    return res.status(400).json({error: "Email already exists"})
                }

                if(user.number === phone) {
                    return res.status(400).json({error: "Username already exists"})
                }
            }
        }
        crypt.hash(password, 10, (err, hashedPass) => {

            
            pool.query('INSERT INTO users (name, email, number, passhash) VALUES ($1, $2, $3, $4)', [name, email, phone, hashedPass], async (err, results) => {
             if(err) return res.status(500).json({error: "Database error"});

             const sign = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '30m'});
             const link = `http://localhost:5000/auth/verify?sign=${sign}`;

             //Add more content to this if possible
             await emailFunc(email, "verify your account", `
                <h2>Hello ${name}</h2>
                <p>PLease verify your account to access all features of the site</p>
                <p>If you didn't create this account, please ignore this email</p>
                <p>This link will expire in 30 minutes</p>
                <a href=${link}>Verify</a>
                <p>Thank You</p>
              `);

             res.status(201).json({ message: 'User created successfully! Verification email sent.' });
            });
        });
    });
});

router.post('/login', (req, res) => {
    const{phoneOremail, password} = req.body;

    if (!phoneOremail) {
        return res.status(400).json({ error: "phone/email is empty" });
    }
//1234567890
    if (!password) {
        return res.status(400).json({ error: "Password is empty" });
    }

    const userID = phoneOremail.trim().toLowerCase();
    let email = null;
    let phone = null;

    if (validator.isEmail(userID)) {
        email = userID;
    } else {
        phone = userID;
    }

    pool.query('SELECT * FROM users WHERE email = $1 OR number = $2', [email, phone], (err, results) => {
        if(err) return res.status(500).json({error: "Database error"});
        if(results.rows.length === 0) res.status(400).json({error: "User not found"});
        
        const user = results.rows[0];

        crypt.compare(password, user.passhash, (err, isMatch) => {
            if(err) return res.status(500).json({error: "server error, matching password"});
            if(!isMatch) return res.status(401).json({error: "Incorrect password"});

            const sign = jwt.sign({usersID: user.id}, process.env.JWT_SECRET, {expiresIn: '1h'});

            //write frontend to get ip address later try for verify
            res.status(200).json({
                message: 'Succesfully logined',
                sign,
                user: {
                    id: user.id,
                    username: user.name,
                    email: user.email
                }
            });
        });
    });
});

module.exports = router;