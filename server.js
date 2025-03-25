const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Import CORS

const app = express();

// Use CORS middleware
app.use(cors()); // Enable all CORS requests
app.use(express.json()); // Enable JSON parsing

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/authDB")
  .then(() => console.log('Database is connected'))
  .catch((err) => console.log(`Database cannot connect because of ${err}`));

// User schema and model
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model("User", UserSchema);

// Signup API
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User created", user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login API
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Email or password is wrong" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Password is incorrect" });

        const token = jwt.sign({ id: user._id }, "SECRET_KEY", { expiresIn: "1h" });
        res.json({ message: "Logged in successfully", token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Server is running on port 3000'));
