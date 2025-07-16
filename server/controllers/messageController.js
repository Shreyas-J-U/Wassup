import Message from "../models/message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// Get all users except the logged-in user
export const getUserForSidebar = async (req, res) => {
  try {
    const userId = req.user._id; // Extract current user's ID from the authenticated request

    // Fetch all users except the logged-in user, and exclude their password field
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    // Object to store count of unseen messages for each user
    const unSeenMessages = {};

    // For each user, count unseen messages sent to the logged-in user
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        recieverId: userId,
        seen: false,
      });

      // If there are unseen messages, store the count
      if (messages.length > 0) {
        unSeenMessages[user._id] = messages.length;
      }
    });

    // Ensure all async operations are completed before proceeding
    await Promise.all(promises);

    // Send the list of users and unseen message count to client
    res.json({ success: true, users: filteredUsers, unSeenMessages });
  } catch (error) {
    console.log(error.message); // Log any server-side errors
    res.json({ success: false, message: error.message });
  }
};

// Get all messages exchanged with the selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params; // ID of the other user in the conversation
    const myId = req.user._id; // Current logged-in user ID

    // Find all messages where either:
    // - the current user sent a message to the selected user
    // - or the selected user sent a message to the current user
    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          recieverId: selectedUserId,
        },
        { senderId: selectedUserId, recieverId: myId },
      ],
    });

    // Mark all messages received from the selected user as seen
    await Message.updateMany(
      { senderId: selectedUserId, recieverId: myId },
      { seen: true }
    );

    // Return the conversation to the client
    res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message); // Log error for debugging
    res.json({ success: false, message: error.message });
  }
};

// Mark a single message as seen using its message ID
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params; // Message ID passed as a URL parameter

    // Update the 'seen' status of the message to true
    await Message.findByIdAndUpdate(id, { seen: true });

    // Send a success response
    res.json({ success: true });
  } catch (error) {
    console.log(error.message); // Log error for debugging
    res.json({ success: false, message: error.message });
  }
};

// Send message to selected user

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const recieverId = req.params.id;
    const senderId = req.user._id;
    let imageURL;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageURL = uploadResponse.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      recieverId,
      text,
      image: imageURL,
    });
    
    // Emit the new message to the reciever's socket
    const recieverSocketId = userSocketMap[recieverId];
    if (recieverSocketId) {
      io.to(recieverSocketId).emit("newMessage", newMessage);
    }
    res.json({ success: true, newMessage });
  } catch (error) {
    console.log(error.message); // Log error for debugging
    res.json({ success: false, message: error.message });
  }
};
