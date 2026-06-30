import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import useAuth from '../hooks/useAuth';
import "./Conversation.css";

const Conversation = ({ conversationId, onMessageSent }) => {
  const { auth } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const fetchConversation = async () => {
    try {
      const response = await axios.get(`/conversations/${conversationId}`, { withCredentials: true });
      setConversation(response.data);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await axios.post('/messages/send', {
        conversationId,
        messageText: inputText
      }, { withCredentials: true });

      setInputText("");
      fetchConversation();
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!conversation) {
    return (
      <div className="ConversationContainer">
        <div className="ConversationMainContainer">
          <div className="ConversationHeader">
            <h2>Loading conversation...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='ConversationContainer'>
      <div className='ConversationMainContainer'>
        <div className='ConversationHeader'>
          <h2>{conversation.name || "Conversation"}</h2>
        </div>
        <div className='conversationContainer'>
          {conversation.messages && conversation.messages.length > 0 ? (
            conversation.messages.map((msg, index) => {
              const isMe = msg.senderId === auth?._id;
              return (
                <div key={index} className={isMe ? 'messageReceiver' : 'messageSender'}>
                  <p>{msg.content || msg.text}</p>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>
              No messages yet. Send a message to start the conversation!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className='messageInputContainer'>
          <input 
            type="text" 
            placeholder='Type your message...' 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit">Send</button>   
        </form>
      </div>
    </div>
  );
};

export default Conversation;
