const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

const corsOptions = {
  origin: "http://localhost:3000", // Update with the origin of your client application
  credentials: true, // Allow credentials (cookies)
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("mongodb Connected");
}

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  dp : String,
});

const User = mongoose.model("User", UserSchema);

app.post("/login", async (req, res) => {
    const { name, email, password, dp } = req.body;
    try {
      let user = await User.findOne({ email }).exec();
      if (!user) {
        // If the user does not exist, automatically register them
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
            username : name,
          email,
          password: hashedPassword,
          dp,
        });

        await user.save();
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        // If passwords do not match, return an error response
        console.log("password mismatch");
        return res
          .status(400)
          .json({ success: false, message: "Invalid email or password." });
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1m",
      });
      res.cookie("token", token, { httpOnly: true, path: "/" });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

// Endpoint for user registration
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  console.log(req.body);
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  try {
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Use a salt factor of 10

    // Create the user with the hashed password
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword, // Store the hashed password in the database
    });

    await newUser.save();
    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

app.get("/userinfo", verifyToken, async (req, res) => {
  // If user is logged in, send user information
  const uId = req.user.userId;
  const userData = await User.findOne({ _id : uId});
  res.json({ message: "User information", user: req.user, userData : userData });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
