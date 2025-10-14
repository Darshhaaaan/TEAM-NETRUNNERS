const nodemailer = require("nodemailer");
const dotenv = require("dotenv")

dotenv.config();

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const emailFunc = async(to, subject, htmlBody) => {
    const mailOptions = {
        from: `"FARM2HOME" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlBody
    }

    try{
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
        return{success: true};
    } catch(error) {
        console.error("Email failed:", error)
        return{success: false, error};
    }
};

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'LOADED' : 'MISSING');

module.exports = emailFunc;