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
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://test1234:test1234@cluster0.2mh3n37.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "hellodevthisisme"
const allowedOrigins = ['https://onlychats.netlify.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(cookieParser());

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("mongodb Connected");
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dp: { type: String },
  gender: { type: String, default: null }, // Added gender field with default null
  bio: { type: String, default: null }, // Added bio field with default null
  // contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const chatroomSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  isGroupChat: { type: Boolean },
  chatName: { type: String, default: null },
  groupChatDp: { type: String }, // Add groupChatDp field
  groupChatBio : { type: String },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chatroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Chatroom' },
  content: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Chatroom = mongoose.model('Chatroom', chatroomSchema);
const Message = mongoose.model('Message', messageSchema);

app.get('/', (req, res) => {
  res.json("App Launched");
})

app.get('/hello', (req, res) => {
  res.json("Hello World dev");
})

app.post("/login", async (req, res) => {
  const { name, email, password, dp } = req.body;
  try {
    let user = await User.findOne({ email }).exec();
    if (!user) {
      // If the user does not exist, automatically register them
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        username: name,
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
        .json({ success: false, message: "Invalid email or password."});
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.cookie('token', token, {
      httpOnly: true,
      secure: 'production', // true in production, false in development
      sameSite: 'Strict', // or 'Lax' or 'None' based on your requirements
      maxAge: 3600000, // 1 hour in milliseconds
      path: "/",
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" , body : req.body });
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
  jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
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
  const userData = await User.findOne({ _id: uId });
  res.json({ message: "User information", user: req.user, userData: userData });
});

app.get("/getallusers", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/createnewchat", async (req, res) => {
  const { userId, participantId } = req.body;

  try {
    // Check if there's an existing chatroom between userId and participantId
    const existingChatroom = await Chatroom.findOne({
      participants: { $all: [userId, participantId] },
      isGroupChat: false
    });

    if (existingChatroom) {
      return res.status(200).json({ success: true, chatroom: existingChatroom });
    }

    // Create a new chatroom if one doesn't exist
    const chatroom = await Chatroom.create({
      admin: userId,
      participants: [userId, participantId],
      isGroupChat: false,
    });

    // Update contacts array for both users
    await User.findByIdAndUpdate(userId, { $addToSet: { contacts: participantId } });
    await User.findByIdAndUpdate(participantId, { $addToSet: { contacts: userId } });

    res.status(201).json({ success: true, chatroom });
  } catch (error) {
    console.error("Error creating chatroom:", error);
    res.status(500).json({ success: false, message: "Failed to create chatroom" });
  }
});


app.post("/getallcontactlist", async (req, res) => {
  const { userId } = req.body; // Assuming userId is sent from the frontend
  try {
    // Fetch all chatrooms where the user is a participant
    const chatrooms = await Chatroom.find({ participants: userId })
      .populate('participants', 'dp username') // Populate 'dp' and 'username' fields of 'participants'
      .populate('admin', 'dp username') // Populate 'dp' and 'username' fields of 'admin')
      .populate({
        path: 'lastMessage',
        select: 'content createdAt',
      });

    // Sort chatrooms by lastMessage.createdAt
    chatrooms.sort((a, b) => {
      if (!a.lastMessage || !b.lastMessage) {
        // Handle cases where lastMessage might be null
        return !a.lastMessage ? 1 : -1;
      }
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.status(200).json({ success: true, chatrooms });
  } catch (error) {
    console.error("Error fetching user's contacts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch contacts" });
  }
});



app.get("/gettheprofiledetails/:contactId", async (req, res) => {
  const contactId = req.params.contactId;

  try {
      // Retrieve the profile details for the contact with the given ID
      const contactDetails = await User.findOne({_id : contactId});

      if (!contactDetails) {
          return res.status(404).json({ success: false, message: "Profile details not found" });
      }

      res.status(200).json({ success: true, contactDetails });
  } catch (error) {
      console.error("Error fetching profile details:", error);
      res.status(500).json({ success: false, message: "Failed to fetch profile details" });
  }
});

// Endpoint to handle sending messages
app.post("/sendmessage", async (req, res) => {
  try {
    // Extract necessary data from the request body
    const { userId, chatId, message } = req.body;

    // Create a new message instance with the provided data
    let newMessage = new Message({
      sender: userId,
      chatroom: chatId,
      content: message
    });

    // Save the new message to the database
    await newMessage.save();

    // Update the lastMessage field of the chatroom with the new message ID
    await Chatroom.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });

    // Populate the sender and chatroom fields using Message.findById
    newMessage = await Message.findById(newMessage._id).populate('sender').populate('chatroom');

    // Respond with the populated message
    res.json({ success: true, newMessage: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});



app.get("/fetchallmessages/:userId/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatroom: chatId }).populate('sender', 'username dp');
    // console.log(messages);
    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
});

app.delete("/deletechat", async (req, res) => {
  const { chatId } = req.body;

  try {
    // Delete messages associated with the chat
    await Message.deleteMany({ chatroom: chatId });

    res.status(200).json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ success: false, message: "Failed to delete chat" });
  }
});

app.post('/createnewgroupchat', async (req, res) => {
  const { chatRoomName, chatRoomBio, avatarimgUrl, selectedUsers, admin } = req.body;

  try {
      // Ensure the admin is included in the selected users
      if (!selectedUsers.includes(admin)) {
          selectedUsers.push(admin);
      }


      // Create a new group chatroom
      const chatroom = new Chatroom({
          chatName: chatRoomName,
          groupChatBio: chatRoomBio,
          groupChatDp: avatarimgUrl, // Use avatarimgUrl as groupChatDp
          participants: selectedUsers,
          admin: admin,
          isGroupChat: true,
      });

      await chatroom.save();

      res.status(201).json({ success: true, chatroom });
  } catch (error) {
      console.error("Error creating group chat:", error);
      res.status(500).json({ success: false, message: "Failed to create group chat" });
  }
});

app.post('/getallchatrooms', async (req, res) => {
  const { userId } = req.body;

  try {
      const chatrooms = await Chatroom.find({
          isGroupChat: true,
          participants: { $ne: userId } // $ne operator to find chat rooms where userId is not in participants
      }).populate('admin participants', 'username dp'); // Populate admin and participants details

      res.status(200).json({ success: true, chatrooms });
  } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ success: false, message: "Failed to fetch chat rooms" });
  }
});

app.post('/joinnewchatroom', async (req, res) => {
  const { userId, chatroomId } = req.body;

  try {
      const chatroom = await Chatroom.findById(chatroomId);

      if (!chatroom) {
          return res.status(404).json({ success: false, message: "Chat room not found" });
      }

      if (chatroom.participants.includes(userId)) {
          return res.status(400).json({ success: false, message: "User already in the chat room" });
      }

      chatroom.participants.push(userId);
      await chatroom.save();

      res.status(200).json({ success: true, message: "Joined chat room successfully", chatroom });
  } catch (error) {
      console.error("Error joining chat room:", error);
      res.status(500).json({ success: false, message: "Failed to join chat room" });
  }
});




const server = app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

const io = require('socket.io')(server, {
  cors: {
    origin: ["https://onlychats.netlify.app", "https://onlychats.vercel.app"], // Add other allowed origins
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  console.log("socket.io connection established");

  socket.on("setup", (userId) => {
    socket.join(userId);
    // console.log(userId);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room - ", room);
  })

  socket.on('typing', (room) => socket.in(room).emit("typing"));
  socket.on('stop typing', (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chatroom;
    // console.log(chat);
    if(!chat.participants) return console.log("chat.user not define");

    chat.participants.forEach(user => {
      if(user === newMessageReceived.sender._id){
        return;
      };
      // console.log("new message", newMessageReceived);
      socket.in(user).emit("message received", newMessageReceived);
    })
  })

  socket.off('setup', (userId) => {
    console.log("User Disconnected");
    socket.leave(userId);
  })
});