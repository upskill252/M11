const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let users = []; // This acts as your database for the lab

exports.register = async (req, res) => {
    const { username, password } = req.body;
    
    // Task 1.1.3: Hash password with unique salt before saving
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    
    users.push({ username, passwordHash: hash });
    res.status(201).json({ message: "User registered with hashed password" });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Task 1.1.4: Verify the hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (isMatch) {
        const token = jwt.sign({ username }, "SECRET_KEY", { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
};