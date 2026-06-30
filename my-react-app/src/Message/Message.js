import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import "./Message.css";
import axios from '../api/axios';
import userIcon from "../Assets/user-icon.jpg";
import Conversation from '../Conversation/Conversation';

const Message = () => {
    const [startMessage, setStartMessage] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const location = useLocation();

    const checkMessages = async () => {
        try {
            const response = await axios.get("/conversations", { withCredentials: true });
            setStartMessage(response.data);
        } catch (error) {
            console.error("Error fetching messages", error);
        }
    }

    useEffect(() => {
        checkMessages();
    }, []);

    useEffect(() => {
        if (location.state?.conversationId) {
            setSelectedConversationId(location.state.conversationId);
        }
    }, [location.state]);

    const handleConversationClick = (conversationId) => {
        setSelectedConversationId(conversationId);
    }

    return (
        <div className='wholeMessageContainer'>
            <div className='messageContainer'>
                <div className='messageMainContainer'>
                    <div className='messageHeader'>
                        <h1>Messages</h1>
                    </div>
                    <div className='messageSearch'>
                        <input type="text" placeholder='Search for messages' />
                        <button>Search</button>
                    </div>
                    {startMessage.map((message, index) => (
                        <div className="messageSection" key={index}>
                            {message.participants.map((participant) => (
                                participant.userId ?
                                    <div key={participant._id} className="participantCard" onClick={() => handleConversationClick(message._id)}>
                                        <img src={userIcon} alt="User" />
                                        <div>
                                            <h2>{participant.userId && participant.userId.name}</h2>
                                            <p>{message.lastMessage ? message.lastMessage.content : "No messages yet"}</p>
                                        </div>
                                    </div>
                                    : null
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            {selectedConversationId && (
                <Conversation 
                    conversationId={selectedConversationId} 
                    onMessageSent={checkMessages}
                />
            )}
        </div>
    )
}

export default Message;
