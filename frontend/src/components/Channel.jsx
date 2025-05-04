// src/components/Channel.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const Channel = ({ channelId }) => {
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    // Fetch channel data
    const fetchChannel = async () => {
      try {
        const response = await axios.get(`/api/channels/${channelId}`);
        setChannel(response.data);
      } catch (err) {
        console.error("Error fetching channel:", err);
      }
    };

    fetchChannel();
  }, [channelId]);

  return (
    <div className="channel">
      {channel ? (
        <>
          <h2>{channel.name}</h2>
          <MessageList channelId={channelId} />
          <MessageInput channelId={channelId} />
        </>
      ) : (
        <p>Loading channel...</p>
      )}
    </div>
  );
};

export default Channel;
