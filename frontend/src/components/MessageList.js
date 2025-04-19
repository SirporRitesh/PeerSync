// src/components/MessageList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Message from "./Message";

const MessageList = ({ channelId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Fetch messages for the current channel
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/messages/${channelId}`);
        setMessages(response.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [channelId]); // Refetch when channelId changes

  return (
    <div className="message-list">
      {messages.map((message) => (
        <Message key={message._id} message={message} />
      ))}
    </div>
  );
};

export default MessageList;
