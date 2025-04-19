// src/components/MessageInput.js
import React, { useState } from "react";
import axios from "axios";

const MessageInput = ({ channelId }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/api/messages",
        { channelId, content: message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Reset message input after sending
      setMessage("");
      console.log("Message sent:", response.data);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="message-input">
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit" disabled={!message.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
