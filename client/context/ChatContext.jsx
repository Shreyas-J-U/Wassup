// Import necessary modules and hooks
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

// Create a new Chat context
export const ChatContext = createContext();

// Chat context provider component
export const ChatProvider = ({ children }) => {
  // Chat messages with the currently selected user
  const [messages, setMessages] = useState([]);

  // All users available for chat
  const [users, setUsers] = useState([]);

  // Currently selected chat user
  const [selectedUser, setSelectedUser] = useState(null);

  // Object to track unseen message count per user
  const [unSeenMsgs, setUnSeenMsgs] = useState({});

  // Access `socket` and `axios` from AuthContext
  const { socket, axios } = useContext(AuthContext);

  /**
   * 🔄 Fetch all users from the backend along with unseen message counts
   */
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users || []);
        setUnSeenMsgs(data.unSeenMessages || {}); // ✅ Ensure fallback to empty object
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /**
   * 💬 Fetch chat messages between the logged-in user and the selected user
   */
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /**
   * ✉️ Send a message to the selected user
   */
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /**
   * 🔔 Subscribe to incoming socket messages
   */
  const subscribeToMsgs = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      // If the message is from the user currently being chatted with
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // Mark message as seen on server
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        // Update unseen count for different sender
        setUnSeenMsgs((prevUnSeenMsgs = {}) => ({
          ...prevUnSeenMsgs,
          [newMessage.senderId]:
            (prevUnSeenMsgs?.[newMessage.senderId] || 0) + 1,
        }));
      }
    });
  };

  /**
   * 🧹 Unsubscribe from socket listeners
   */
  const unsubscribeFromMsgs = () => {
    if (socket) socket.off("newMessage");
  };

  /**
   * 📡 Manage socket event subscriptions
   */
  useEffect(() => {
    subscribeToMsgs();
    return () => {
      unsubscribeFromMsgs();
    };
  }, [socket, selectedUser]);

  // Provide values via context
  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    unSeenMsgs,
    setUnSeenMsgs,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
