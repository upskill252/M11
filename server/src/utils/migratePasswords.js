const bcrypt = require('bcryptjs');
const fs = require('fs');

// Mocking a database dump of cleartext passwords
const cleartextDb = [
    { username: "tech_support", password: "password123" },
    { username: "admin", password: "admin_password" }
];

async function migrate() {
    const hashedDb = await Promise.all(cleartextDb.map(async (user) => {
        // Task 1.1.3: Apply hash with a unique salt
        const salt = await bcrypt.genSalt(12); // Factor 12 as per example
        const hash = await bcrypt.hash(user.password, salt);
        return { username: user.username, passwordHash: hash };
    }));

    console.log("Migration Complete. Example Hash:", hashedDb[0].passwordHash);
    return hashedDb;
}

module.exports = migrate;