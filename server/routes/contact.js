const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html');

router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    const sanitizedData = {
        name: sanitizeHtml(name),
        email: sanitizeHtml(email),
        subject: sanitizeHtml(subject),
        message: sanitizeHtml(message),
    };

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: sanitizedData.email,
            to: 'gabrielle.bragdon@hotmail.ca',
            subject: `Contact Form: ${sanitizedData.subject}`,
            text: `Name: ${sanitizedData.name}\nEmail: ${sanitizedData.email}\nMessage: ${sanitizedData.message}`,
        });
        res.json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;
