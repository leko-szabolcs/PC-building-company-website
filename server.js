const express = require('express');
const path = require('path');
const app = express();
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./db');
const bcrypt =require('bcrypt')
const crypto = require('crypto');
const fs = require('fs');

app.use(session({
    secret: 'titkos-kulcs',   
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'pages')));
app.use(express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'pictures')));
app.use(bodyParser.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 
app.use('/product_images', express.static(path.join(__dirname, '/product_images')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Hibás email formátum. Kérlek használj igazi emailt (proba@email.com).' });
    }

    try {
        
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'Ez az email már regisztrálva van.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

        const userId = result.insertId;
        if (!userId) {
            return res.status(500).json({ success: false, message: 'Nem sikerült létrehozni a felhasználót.' });
        }

        req.session.userId = userId;
        req.session.userEmail = email;

        res.json({ success: true, userId, message: 'Sikeres regisztráció.' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Hiba történt a regisztráció során.' });
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

app.post('/send-gen-passw',async (req, res) => {

    const { email } = req.body;

    const [user] = await db.query('SELECT ID FROM users WHERE email = ?', [email]);
    if (!user) {
        return res.status(404).json({ success: false, message: 'Email cím nem található!' });
    }
    
    const newPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    const emailContent = `Elfelejtett jelszó!\n\nAz új jelszavad a PC-MENNY fiókhoz:\n\n${newPassword}\n\nJavasoljuk, hogy jelentkezz be, és azonnal módosítsd ezt a jelszót.`;

    const mailOptions = {
        from: 's79671030@gmail.com',
        to: email,
        subject: 'PC-MENNY Jelszó visszaállítás',
        text: emailContent
    };

    const transporter = nodemailer.createTransport({
        service: 'gmail',  
        auth: {
            user: 's79671030@gmail.com', 
            pass: 'zewd pbjz pybw bgbu'        
        }
    });

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, error: 'Nem sikerült elküldeni az emailt!' });
        }
        console.log('Email elküldve: ' + info.response);
        res.json({ success: true, message: 'Az új jelszó elküldve az email címére.' });
    });
});

app.post('/api/login', async (req, res) => {
    const { email, password, rememberMe } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            const user = rows[0];
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                req.session.userId = user.ID; 
                req.session.userEmail = user.email;
                req.session.loginTime = Date.now(); 

                await db.query('UPDATE users SET online = 1 WHERE email = ?', [user.email]);

                if (rememberMe) {
                    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
                } else {
                    req.session.cookie.expires = false; 
                }
                res.status(200).json({ success: true, message: 'Bejelentkezés sikeres' });
            } else {
                res.status(401).json({ success: false, message: 'Rossz jelszó' });
            }
        } else {
            res.status(404).json({ success: false, message: 'Felhasználó nem található' });
        }
    } catch (error) {
        console.error('Hiba bejelentkezés közben:', error);
        res.status(500).json({ success: false, message: 'Szerver hiba' });
    }
});

app.get('/navbar', (req, res) => {
    const isLoggedIn = req.session && req.session.userId;
    
    const userLink = isLoggedIn ? '/pages/user.html' : '/pages/login.html';

    res.json({ userLink });
});

function autoLogout(req, res, next) {
    if (req.session && req.session.loginTime) {
        const currentTime = Date.now();
        const sessionAge = currentTime - req.session.loginTime;

        if (sessionAge > 30 * 60 * 1000) {
            db.query('UPDATE users SET online = 0 WHERE id = ?', [req.session.userId], (err) => {
                if (err) {
                    console.error('Hiba az online státusz frissítése során:', err);
                }
            });

            req.session.destroy((err) => {
                if (err) {
                    console.error('Hiba a munkamenet megsemmisítése során:', err);
                }
            });

            res.clearCookie('connect.sid');
            return res.status(401).json({ success: false, message: 'Automatikus kijelentkezés' });
        }
    }
    next();
}


app.get('/api/check-login', autoLogout, (req, res) => {
    const isLoggedIn = !!req.session.userId;
    const userID = isLoggedIn ? req.session.userId : null;
    const userEmail = isLoggedIn ? req.session.userEmail : null;
    res.json({ isLoggedIn, userID, userEmail });
});

app.post('/api/logout', async (req, res) => {
    if (req.session.userId) {
        try {
            await db.query('UPDATE users SET online = 0 WHERE id = ?', [req.session.userId]);

            req.session.destroy((err) => {
                if (err) {
                    console.error('Nem sikerült a munkamenet megsemmisítése:', err);
                    return res.status(500).json({ success: false, message: 'Kijelentkezés nem sikerült' });
                }
                res.clearCookie('connect.sid');
                res.json({ success: true, message: 'Logged out successfully' });
            });
        } catch (error) {
            console.error('Hiba a kijelentkezésnél:', error);
            res.status(500).json({ success: false, message: 'Hiba kijelentkezés közben' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Nem talált aktív munkamenetet' });
    }
});

app.post('/api/delete-user', (req, res) => {
    const userId = req.session.userId;

    req.session.destroy(async (err) => {
        if (err) {
            console.error('Nem sikerült törölni a munkamenetet:', err);
            return res.status(500).json({ success: false, message: 'Munkamenet törlése sikertelen.' });
        }

        try {
            await db.deleteUserById(userId);
            res.json({ success: true });
        } catch (error) {
            console.error('Hiba felhasználó törlés közben:', error);
            res.status(500).json({ success: false, message: 'Felhasználó törlése sikertelen.' });
        }
    });
});

app.post('/api/toggle-subscription', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Felhasználó nincs hitelesítve.' });
    }

    try {
        const [rows] = await db.query('SELECT subscribed FROM subscription WHERE userId = ?', [userId]);
        
        if (rows.length === 0) {
            await db.query('INSERT INTO subscription (userId, subscribed) VALUES (?, 1)', [userId]);
            return res.json({ success: true, subscribed: 1 });
        } else {
            const currentStatus = rows[0].subscribed;
            const newStatus = currentStatus === 1 ? 0 : 1;
            await db.query('UPDATE subscription SET subscribed = ? WHERE userId = ?', [newStatus, userId]);
            return res.json({ success: true, subscribed: newStatus });
        }
    } catch (error) {
        console.error('Hiba történt az feliratkozás állapotának frissítésekor:', error);
        res.status(500).json({ success: false, message: 'Az feliratkozás frissítése nem sikerült.' });
    }
});

app.get('/api/check-subscription', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Felhasználó nincs hitelesítve.' });
    }

    try {
        const [rows] = await db.query('SELECT subscribed FROM subscription WHERE userId = ?', [userId]);
        if (rows.length === 0) {
            return res.json({ success: true, subscribed: 0 });
        }
        res.json({ success: true, subscribed: rows[0].subscribed });
    } catch (error) {
        console.error('Hiba történt az feliratkozás állapotának megnézése közben:', error);
        res.status(500).json({ success: false, message: 'Hiba történt az feliratkozás állapotának megfigyelésekor:' });
    }
});

app.post('/api/update-password', async (req, res) => {
    const { password } = req.body;

    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Be kell jelentkezni a jelszó megváltoztatásához.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query('UPDATE users SET password = ? WHERE ID = ?', [hashedPassword, req.session.userId]);

        res.json({ success: true, message: 'A jelszó sikeresen megváltozott.' });
    } catch (error) {
        console.error('Hiba a jelszó frissítése közben:', error);
        res.status(500).json({ success: false, message: 'Hiba történt a jelszó megváltoztatása során.' });
    }
});

app.get('/get-user-email', (req, res) => {
    if (req.session.userEmail) {
        return res.json({ success: true, email: req.session.userEmail });
    }
    res.status(401).json({ success: false, message: 'A felhasználó nincs bejelentkezve!' });
});


app.post('/api/reviews', async (req, res) => {
    const { name, reviewText, stars, picture } = req.body;

    if (!req.session.userId) {
        return res.status(403).json({ error: 'Be kell jelentkezned ahhoz, hogy értékelést tudj írni!' });
    }

    if (!name || !reviewText || !stars) {
        return res.status(400).json({ error: 'Minden mező kitöltése közelező, a képet leszámítva!' });
    }

    let finalPicture = picture;

    if (!picture) {
        try {
            const defaultImagePath = 'D:/pc_site/repo/PC-building-company-website/pictures/img.jpg';
            const imageBuffer = fs.readFileSync(defaultImagePath);
            finalPicture = imageBuffer.toString('base64'); 
        } catch (err) {
            console.error('Hiba történt az alapértelmezett kép olvasása közben:', err);
            return res.status(500).json({ error: 'Szerver hiba: alapértelmezett kép hiányzik.' });
        }
    } else if (picture && !/^data:image\/(png|jpeg);base64,/.test(picture)) {
        console.warn('Hibásnak tűnő kép.');
        return res.status(400).json({ error: 'Hibás kép formátum. Csak PNG és JPG képek elfogadottak.' });
    }

    try {
        const query = `INSERT INTO reviews (userID, name, review_text, stars, picture) VALUES (?, ?, ?, ?, ?)`;
        await db.query(query, [req.session.userId, name, reviewText, stars, finalPicture]);

        res.status(200).json({ message: 'Értékelés sikeresen feltöltve.' });
    } catch (err) {
        console.error('Adatbázis lekérdezési hiba:', err);
        res.status(500).json({ error: 'Nem sikerült lementeni az értékelést.' });
    }
});

const detectMimeType = (base64String) => {
    const match = base64String.match(/^data:(image\/[a-zA-Z]+);base64,/);
    return match ? match[1] : null;
};

app.get('/api/reviews', async (req, res) => {
    const query = `SELECT * FROM reviews`;
    try {
        const [results] = await db.query(query);

        const formattedResults = results.map((review) => {
            let picture = review.picture || '../pictures/img.jpg';
            if (review.picture && !review.picture.startsWith('data:image/')) {
                const mimeType = detectMimeType(review.picture);
                picture = mimeType ? `data:${mimeType};base64,${review.picture}` : `data:image/jpeg;base64,${review.picture}`;
            }
            return { ...review, picture };
        });

        res.status(200).json(formattedResults);
    } catch (err) {
        console.error('Adatbázis lekérdezési hiba:', err);
        res.status(500).json({ error: 'Értékelések lekérése sikertelen.' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const { sortOrder = 'newest', processor = '', videocard = '', memory = '', q = '' } = req.query;

        let query = `
            SELECT 
                p.productID, 
                p.product_name, 
                COALESCE(
                    (SELECT imageURL 
                     FROM product_images 
                     WHERE productID = p.productID AND isPrimary = TRUE LIMIT 1),
                    '/pictures/pc_example.jpg'
                ) AS picture,
                p.price
            FROM products p
            WHERE 1=1
        `;

        const filters = [];
        const queryParams = [];

        if (q) {
            filters.push(`p.product_name LIKE ?`);
            queryParams.push(`%${q}%`);
        }

        if (processor) {
            const processorFilters = processor.split(',');
            filters.push(`p.processor IN (${processorFilters.map(() => '?').join(',')})`);
            queryParams.push(...processorFilters);
        }

        if (videocard) {
            const videocardFilters = videocard.split(',');
            filters.push(`p.videocard IN (${videocardFilters.map(() => '?').join(',')})`);
            queryParams.push(...videocardFilters);
        }

        if (memory) {
            const memoryFilters = memory.split(',');
            filters.push(`p.memory IN (${memoryFilters.map(() => '?').join(',')})`);
            queryParams.push(...memoryFilters);
        }

        if (filters.length > 0) {
            query += ` AND (${filters.join(' AND ')})`;
        }

        switch (sortOrder) {
            case 'asc':
                query += ` ORDER BY p.price ASC`;
                break;
            case 'desc':
                query += ` ORDER BY p.price DESC`;
                break;
            case 'oldest':
                query += ` ORDER BY p.productID ASC`;
                break;
            case 'newest':
            default:
                query += ` ORDER BY p.productID DESC`;
                break;
        }

        const [rows] = await db.query(query, queryParams);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Nem található termék.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Hiba a termékek lekérdezése közben:', error);
        res.status(500).json({ error: 'Nem sikerült lekérni a termékeket.' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    const productID = req.params.id;

    try {
        const productQuery = `
            SELECT 
                p.productID, 
                p.product_name, 
                p.processor, 
                p.videocard, 
                p.motherboard, 
                p.memory, 
                p.ssd_hdd, 
                p.psu, 
                p.opsys, 
                p.ventillation, 
                p.cases, 
                p.second_hdd_ssd, 
                p.price, 
                COALESCE(
                    (SELECT imageURL 
                     FROM product_images 
                     WHERE productID = p.productID AND isPrimary = TRUE LIMIT 1),
                    '/pictures/pc_example.jpg'
                ) AS picture
            FROM products p
            WHERE p.productID = ?;
        `;

        const additionalImagesQuery = `
            SELECT imageURL 
            FROM product_images 
            WHERE productID = ? AND isPrimary = FALSE;
        `;

        const [[product]] = await db.query(productQuery, [productID]);
        if (!product) {
            return res.status(404).json({ error: 'Nem található termék.' });
        }

        const [additionalImages] = await db.query(additionalImagesQuery, [productID]);
        product.additionalPictures = additionalImages.map(img => img.imageURL);

        res.json(product);
    } catch (error) {
        console.error('Hiba a termékek lekérdezése közben:', error);
        res.status(500).json({ error: 'Nem sikerült lekérni a termékeket.' });
    }
});

app.get('/api/search', async (req, res) => {
    const searchQuery = req.query.q;
    if (!searchQuery) {
        return res.status(400).json({ error: 'Keresési lekérdezés szükséges' });
    }

    try {
        const query = `
            SELECT 
                p.productID, 
                p.product_name, 
                COALESCE(
                    (SELECT imageURL 
                     FROM product_images 
                     WHERE productID = p.productID AND isPrimary = TRUE LIMIT 1),
                    '/pictures/pc_example.jpg'
                ) AS picture
            FROM products p
            WHERE p.product_name LIKE ?
        `;
        const [rows] = await db.query(query, [`%${searchQuery}%`]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Nem található termék.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Hiba a keresés feldolgozása közben:', error);
        res.status(500).json({ error: 'Hiba történt keresés közben.' });
    }
});

app.post('/api/shopping-cart', async (req, res) => {
    const { productID, userID, quantity } = req.body;

    try {
        const [[product]] = await db.query(
            'SELECT price, quantity FROM products WHERE productID = ?',
            [productID]
        );

        if (!product) {
            return res.status(404).json({ error: 'Nem található termék.' });
        }

        const availableQuantity = product.quantity;
        const price = parseFloat(product.price);

        if (price === null || isNaN(price) || availableQuantity === null || isNaN(availableQuantity)) {
            throw new Error('Hibás termék adat.');
        }

        const [cartItems] = await db.query(
            'SELECT productID FROM shopping_cart WHERE userID = ?',
            [userID]
        );

        const uniqueProductIDs = new Set(cartItems.map(item => item.productID));

        if (!uniqueProductIDs.has(productID) && uniqueProductIDs.size >= 2) {
            return res.status(400).json({
                error: 'Legfeljebb 2 különböző terméket helyezhet a kosárba.',
            });
        }

        const [[existingItem]] = await db.query(
            'SELECT quantity FROM shopping_cart WHERE productID = ? AND userID = ?',
            [productID, userID]
        );

        const currentCartQuantity = existingItem ? existingItem.quantity : 0;
        const newQuantity = currentCartQuantity + quantity;

        if (newQuantity > availableQuantity) {
            return res.status(400).json({
                error: `Ezt a terméket nem lehet hozzáadni. Nincs több elérhető.`,
            });
        }

        if (existingItem) {
            await db.query(
                'UPDATE shopping_cart SET quantity = quantity + ?, total = total + ? WHERE productID = ? AND userID = ?',
                [quantity, price * quantity, productID, userID]
            );
        } else {
            const total = price * quantity;
            await db.query(
                'INSERT INTO shopping_cart (productID, userID, quantity, total) VALUES (?, ?, ?, ?)',
                [productID, userID, quantity, total]
            );
        }

        res.status(200).json({ message: 'A termék a kosárba került.' });
    } catch (error) {
        console.error('Hiba /api/shopping-cart-ban:', error);
        res.status(500).json({ error: 'Nem sikerült a terméket kosárba helyezni.' });
    }
});

app.get('/api/shopping-cart', async (req, res) => {
    const userID = req.query.userID;

    if (!userID) {
        return res.status(400).json({ error: 'UserID szükséges.' });
    }

    const cartQuery = `
        SELECT 
            sc.productID, 
            sc.quantity, 
            sc.total, 
            p.product_name, 
            img.imageURL AS picture
        FROM 
            shopping_cart sc
        INNER JOIN 
            products p ON sc.productID = p.productID
        LEFT JOIN 
            product_images img ON p.productID = img.productID AND img.isPrimary = TRUE
        WHERE 
            sc.userID = ?;
    `;

    try {
        const [cartItems] = await db.query(cartQuery, [userID]);
        res.json(cartItems);
    } catch (error) {
        console.error('Hiba a kosár tételeinek lekérésekor:', error);
        res.status(500).json({ error: 'Nem sikerült lekérni a kosár tételeit.' });
    }
});

app.delete('/api/shopping-cart', async (req, res) => {
    const { productID, userID } = req.body;

    try {
        await db.query('DELETE FROM shopping_cart WHERE productID = ? AND userID = ?', [productID, userID]);
        res.status(200).json({ message: 'A termék eltávolítva a kosárból.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Nem sikerült eltávolítani a tételt a kosárból.' });
    }
});

app.post('/api/payments', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { amount, method, userID } = req.body;


        if (!amount || !method || !userID) {
            return res.status(400).json({ success: false, error: 'Hiányoznak a kötelező mezők.' });
        }

        await connection.beginTransaction();

        const paymentQuery = `
            INSERT INTO payments (amount, method, userID)
            VALUES (?, ?, ?)
        `;
        const [paymentResult] = await connection.execute(paymentQuery, [amount, method, userID]);
        const paymentID = paymentResult.insertId;

        const cartQuery = `
            SELECT productID, quantity 
            FROM shopping_cart 
            WHERE userID = ?
        `;
        const [cartItems] = await connection.execute(cartQuery, [userID]);

        if (!cartItems.length) {
            throw new Error('Nincsenek termékek a kosárban.');
        }

        const updateQuantityQuery = `
            UPDATE products 
            SET quantity = quantity - ? 
            WHERE productID = ? AND quantity >= ?
        `;
        const orderItemsQuery = `
            INSERT INTO payment_products (paymentID, productID, quantity)
            VALUES (?, ?, ?)
        `;

        for (const item of cartItems) {
            const { productID, quantity } = item;

            const [product] = await connection.execute(
                `SELECT quantity FROM products WHERE productID = ?`,
                [productID]
            );

            if (!product.length || product[0].quantity < quantity) {
                throw new Error(
                    `Nincs elegendő készlet a termékazonosítóhoz: ${productID}. Elérhető: ${product[0].quantity}, Rendelve: ${quantity}`
                );
            }

            await connection.execute(updateQuantityQuery, [quantity, productID, quantity]);

            await connection.execute(orderItemsQuery, [paymentID, productID, quantity]);
        }

        const clearCartQuery = `
            DELETE FROM shopping_cart WHERE userID = ?
        `;
        await connection.execute(clearCartQuery, [userID]);

        await connection.commit(); 
        res.status(201).json({ success: true, message: 'Megrendelés sikeresen leadva.', paymentID });
    } catch (error) {
        await connection.rollback(); 
        console.error('Hiba a rendelés feldolgozása közben:', error.message);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release(); 
    }
});

app.get('/api/last-purchased-products', async (req, res) => {
    const userID = req.query.userID;

    if (!userID) {
        return res.status(400).json({ success: false, message: 'Hiányzó userID' });
    }

    try {
        const query = `
            SELECT 
                p.product_name,
                COALESCE(pi.imageURL, '../product_images/pc_example.jpg') AS picture,
                pp.quantity
            FROM 
                payments AS pay
            INNER JOIN 
                payment_products AS pp ON pay.paymentID = pp.paymentID
            INNER JOIN 
                products AS p ON pp.productID = p.productID
            LEFT JOIN 
                product_images AS pi ON p.productID = pi.productID AND pi.isPrimary = TRUE
            WHERE 
                pay.userID = ? 
            ORDER BY 
                pay.paymentID DESC
            LIMIT 2;
        `;

        const [rows] = await db.query(query, [userID]);

        return res.json({ success: true, products: rows });
    } catch (error) {
        console.error('Hiba történt az utoljára vásárolt termékek lekérésekor:', error);
        return res.status(500).json({ success: false, message: 'Szerver hiba.' });
    }
});

app.get('/api/filters', async (req, res) => {
    try {
        const { q = '', processor = '', videocard = '', memory = '' } = req.query;

        let baseQuery = `
            SELECT DISTINCT p.processor, p.videocard, p.memory
            FROM products p
            WHERE 1=1
        `;

        const filters = [];
        const queryParams = [];

        if (q) {
            filters.push(`p.product_name LIKE ?`);
            queryParams.push(`%${q}%`);
        }

        if (processor) {
            const processorFilters = processor.split(',');
            filters.push(`p.processor IN (${processorFilters.map(() => '?').join(',')})`);
            queryParams.push(...processorFilters);
        }

        if (videocard) {
            const videocardFilters = videocard.split(',');
            filters.push(`p.videocard IN (${videocardFilters.map(() => '?').join(',')})`);
            queryParams.push(...videocardFilters);
        }

        if (memory) {
            const memoryFilters = memory.split(',');
            filters.push(`p.memory IN (${memoryFilters.map(() => '?').join(',')})`);
            queryParams.push(...memoryFilters);
        }

        if (filters.length > 0) {
            baseQuery += ` AND (${filters.join(' AND ')})`;
        }

        const [rows] = await db.query(baseQuery, queryParams);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'No available filters found.' });
        }

        const availableFilters = {
            processor: [...new Set(rows.map(row => row.processor))],
            videocard: [...new Set(rows.map(row => row.videocard))],
            memory: [...new Set(rows.map(row => row.memory))],
        };

        res.json(availableFilters);
    } catch (error) {
        console.error('Error fetching filters:', error);
        res.status(500).json({ error: 'Failed to fetch filter options.' });
    }
});



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Szerver ezen a porton fut: ${PORT}`);
});