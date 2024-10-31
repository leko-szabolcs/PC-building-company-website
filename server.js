const express = require('express');
const path = require('path');
const app = express();
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const db = require('./db');

app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'pages')));
app.use(express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'pictures')));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

//peoba fetch
app.get('/api/data', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

app.post('/send-email', (req, res) => {
    const { name, email, message, service  } = req.body;

    console.log('Received data:', req.body);

    let emailContent;

    if (!name && !message && !service) {
        emailContent = `Elfelejtett jelszó! Ha ezt az e-mailt látod, valaki (remélhetőleg te) elfelejtette a jelszavát.\nErre a linkre kattintva beállíthatsz egy új jelszót: http://localhost:8080/pages/new_password.html?email=${email}`;
    } else {
        emailContent = `Kaptál egy új üzenetet.\n\nNév: ${name}\nEmail: ${email}\nÜzenet: ${message}`;
        if (service) {
            emailContent = `Kaptál egy új ${service} kérelmet.\n\nNév: ${name}\nEmail: ${email}\nÜzenet: ${message}`;
        }
    }
 
    const transporter = nodemailer.createTransport({
        service: 'gmail',  
        auth: {
            user: 's79671030@gmail.com', 
            pass: 'zewd pbjz pybw bgbu'        
        }
    });

    

    let mailOptions = {
        from: email, 
        to: 's79671030@gmail.com', 
        subject: service ? `Új ${service} kérelem ${name}-től` : `Új üzenet ${name}-től!`,
        text: emailContent
    };

    if(!name && !message && !service) {
         mailOptions = {
            from: 's79671030@gmail.com', 
            to: email, 
            subject: `Új üzenet a PC-MENNY ügyfélszolgálattól!`,
            text: emailContent
        };
    }

   
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, error: 'Nem sikerült elküldeni az emailt!' });
        }
        console.log('Email elküldve: ' + info.response);
        res.json({ success: true }); 
    });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Szerver ezen a porton fut: ${PORT}`);
});