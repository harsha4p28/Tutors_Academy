const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken')
const session = require('express-session');
const cors = require('cors');
const mongoose= require("mongoose");
const bcrypt= require("bcrypt");
require("dotenv").config();
const MongoStore = require('connect-mongo');


const {User, Children, User2} = require("./model/users"); 
const {Message, Conversation} = require("./model/messages");


const app = express();
const PORT = process.env.PORT || 5000;


const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/tutors_academy";
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_key';

const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());


// For session
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_session_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    maxAge: 24 * 60 * 60 * 1000, 
  },
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    ttl: 24 * 60 * 60, 
    autoRemove: 'disabled',
  }),
}));


//Registration
app.post('/register', async (req, res) => {
  try {
    const { name, email, phone, address, city, state, postalCode,experience, password ,role} = req.body;
    const existingUser = await (role === 'Parent' ? User : User2).findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const UserModel = role === 'Parent' ? User : role === 'Tutor' ? User2 : null;
    if (!UserModel) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const newUser = new UserModel({
      name,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      password: hashedPassword, 
      role,
      ...(role === 'Tutor' && { experience }),
    });
  
    await newUser.save();

    req.session.userId = newUser._id;
    res.status(201).json({ message: "User registered successfully" });
    console.log('Successfully Registered:', req.body);    

  }catch (error) {
    console.error("Register Error:", error.message, error.stack);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

//Login
app.post('/login', async (req, res) => {
  try{
    const { email, password } = req.body;
    if (!email || !password ) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const foundUser = await User.findOne({ email }) || await User2.findOne({ email });
      if (!foundUser) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }  
      const match = await bcrypt.compare(password, foundUser.password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ userId: foundUser._id }, JWT_SECRET, { expiresIn: "1h" });
      res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction, 
        sameSite: "Lax",
        maxAge: 3600000, 
      });

      res.json({ success: `User ${email} is logged in!`, role:foundUser.role , userId:foundUser._id });
      console.log('User logged in:', foundUser._id);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get("/parent", async (req,res)=>{
  try {
    const token= req.cookies.token;
    if(!token) return res.status(401).json({message:"Unauthorized"});
    const decoded = jwt.verify(token, JWT_SECRET);
    const parent = await User.findById(decoded.userId).select("children");
    console.log(parent.children);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const children = await Children.find({ '_id': { $in: parent.children } });

    res.json(children); 
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
})

app.post("/parent/addchild",async (req,res)=>{
  try{
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const parent = await User.findById(decoded.userId);
    console.log("Parent ID:", parent);
    if (!parent) return res.status(404).json({ message: "Parent not found" });

    const { name, email, phone, class: studentClass, syllabus, subject, preferedTutor, preferedTime } = req.body;

    const newChild = new Children({
      name,
      email,
      phone,
      class: studentClass,
      syllabus,
      subject,
      preferedTutor,
      preferedTime,
      user: parent._id
    });

    await newChild.save();
    parent.children.push(newChild._id);
    await parent.save();
    res.status(201).json({ message: "Child added successfully", child: newChild });
  }catch (error) {
    console.error('Error adding child:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password") || await User2.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: user });
  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
});


app.get('/refresh', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password") || await User2.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const newToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: false, 
      sameSite: "Lax",
      maxAge: 3600000, 
    });
    res.json({ success: "Token refreshed successfully" });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.get('/tutors/search',async (req,res)=>{
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password") ;
    if (!user) return res.status(404).json({ message: "User not found" });
    const query = req.query.query || "";
    const searchRegex = { $regex: query, $options: 'i' };
    const tutors = await User2.find({
      $or: [
        { name: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
        { subject: searchRegex },
        { class: searchRegex }
      ]
    }).select("-password");
    res.json(tutors);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
})

app.get('/students/search',async (req,res)=>{
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User2.findById(decoded.userId).select("-password") ;
    if (!user) return res.status(404).json({ message: "User not found" });
    const query = req.query.query || "";
    const searchRegex = { $regex: query, $options: 'i' };
    
    const conditions = [
      { name: searchRegex },
      { subject: searchRegex },
      { syllabus: searchRegex },
      { preferedTutor: searchRegex }
    ];

    const parsedNum = Number(query);
    if (!isNaN(parsedNum) && query.trim() !== "") {
      conditions.push({ class: parsedNum });
    }

    const child = await Children.find({
      $or: conditions
    }).select("-password");
    res.json(child);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
})


app.post('/student/start', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const senderId = decoded.userId;

    const { senderType, receiverId, receiverType } = req.body;
    if (!senderId || !receiverId || !receiverType || !senderType) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    let actualReceiverId = receiverId; 

    if (receiverType === 'User') {
      const parent = await User.findOne({ children: receiverId });
      if (parent) {
        actualReceiverId = parent._id;
      }
    }
    console.log(actualReceiverId,receiverId);

    let conversation = await Conversation.findOne({
      $and: [
        { participants: { $elemMatch: { userId: senderId, userModel: senderType } } },
        { participants: { $elemMatch: { userId: actualReceiverId, userModel: receiverType } } }
      ]
    });

    if (conversation) {
      return res.status(200).json({ message: "Conversation already exists", conversationId: conversation._id });
    }

    const newConversation = new Conversation({
      participants: [
        { userId: senderId, userModel: senderType },
        { userId: actualReceiverId, userModel: receiverType }
      ]
    });

    await newConversation.save();
    res.status(201).json({ message: "Conversation started successfully", conversationId: newConversation._id });

  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
 
app.get('/conversations', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const conversations = await Conversation.find({
      "participants.userId": userId,
      lastMessage: { $ne: null } // Discard conversations with no messages
    })
      .populate({
        path: 'participants.userId',
        select: 'name email phone',
        strictPopulate: false 
      })
      .populate({
        path: 'lastMessage',
        select: 'content timestamp isRead',
      })
      .sort({ lastUpdated: -1 });

      const filteredConversations = conversations.map(conversation => {
        // Filter out ourselves from the participants list returned to client
        const otherParticipants = conversation.participants.filter(participant => {
          return participant.userId && participant.userId._id.toString() !== userId.toString(); 
        });
        
        // Deep copy/clone to modify participants securely
        const convObj = conversation.toObject();
        convObj.participants = otherParticipants;
        return convObj;
      });
  
      console.log("Filtered Conversations:", filteredConversations);
  
      res.json(filteredConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.post('/messages/send', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const myId = decoded.userId;
    const { conversationId, messageText } = req.body;


    if (!conversationId || !messageText) {
      return res.status(400).json({ error: 'Missing conversationId or messageText' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }


    // Find sender and receiver from participants
    const senderPart = conversation.participants.find(p => p.userId.toString() === myId.toString());
    const receiverPart = conversation.participants.find(p => p.userId.toString() !== myId.toString());

    if (!senderPart) {
      return res.status(400).json({ error: 'Sender participant not found in conversation' });
    }
    if (!receiverPart) {
      return res.status(400).json({ error: 'Receiver participant not found in conversation' });
    }

    const newMessage = await Message.create({
      senderId: senderPart.userId,
      senderModel: senderPart.userModel,  
      receiverId: receiverPart.userId,
      receiverModel: receiverPart.userModel,  
      conversationId: conversation._id,
      content: messageText,
      isRead: false
    });

    await Conversation.findByIdAndUpdate(
      conversation._id,
      {
        lastMessage: newMessage._id,
        lastUpdated: new Date()
      }
    );

    res.status(201).json({ success: true, message: 'Message sent successfully.', messageData: newMessage });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', details: error.message, stack: error.stack });
  }
});

app.get('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const myId = decoded.userId;

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required" });
    }

    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: 'participants.userId',
        select: 'name email phone',
        strictPopulate: false 
      });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const otherParticipant = conversation.participants.find(p => p.userId && p.userId._id.toString() !== myId.toString());
    const otherName = otherParticipant && otherParticipant.userId ? otherParticipant.userId.name : "Conversation";

    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 }); 

    res.status(200).json({
      _id: conversation._id,
      name: otherName,
      messages: messages
    });
    
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get("/profile", async (req,res)=>{
  const token=req.cookies.token;
  if(!token) return res.status(401).json({message:"Unauthorized"});
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log("Decoded token:", decoded);
  const user = await User.findById(decoded.userId).select("-password") || await User2.findById(decoded.userId).select("-password");
  console.log(user);
  if(!user) return res.status(404).json({message:"User not found"});
  return res.json({user:user});

});

app.post("/profile/change-password", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" });
    }

    const user = await User.findById(userId) || await User2.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax'
  });

  req.session.destroy(err => {
    if (err) {
      console.error('Logout session destroy error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); 
    res.json({ message: 'Logged out successfully' });
  });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
