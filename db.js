const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: '',  
    database: 'pc_site',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

async function getProducts(sortOrder = 'newest') {
    let query = `
        SELECT p.*, pi.imageURL AS picture 
        FROM products p
        LEFT JOIN product_images pi ON p.productID = pi.productID AND pi.isPrimary = TRUE
    `;
    switch (sortOrder) {
        case 'asc':
            query += ' ORDER BY p.price ASC';
            break;
        case 'desc':
            query += ' ORDER BY p.price DESC';
            break;
        case 'oldest':
            query += ' ORDER BY p.productID ASC';
            break;
        case 'newest':
        default:
            query += ' ORDER BY p.productID DESC';
            break;
    }

    const [rows] = await pool.query(query);
    return rows;
}

function deleteUserById(userId, callback) {
    const query = 'DELETE FROM users WHERE id = ?';
    pool.query(query, [userId], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
}

async function getProductById(productID) {
    const [rows] = await pool.execute('SELECT * FROM products WHERE productID = ?', [productID]);
    return rows[0];
}

async function handlePayment(userId, paymentID, products) {
    console.log("handlePayment called with:", userId, paymentID, products);
    for (const product of products) {
        try {
            await pool.query(
                'INSERT INTO payment_products (paymentID, productID, quantity) VALUES (?, ?, ?)',
                [paymentID, product.productID, product.quantity]
            );
        } catch (error) {
            console.error("Error inserting into payment_products:", error);
        }
    }
}

module.exports = {
    getProductById,
    getProducts,
    deleteUserById,
    handlePayment,
    getConnection: () => pool.getConnection(),
    query: pool.query.bind(pool),
    execute: pool.execute.bind(pool),
};