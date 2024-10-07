import React, { useState, useEffect, useRef } from 'react';
import { supabase, sendMessage, deleteMessage, updateMessage, getCurrentUser } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import EmojiPicker from 'emoji-picker-react';
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa'; // Add this import

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    fetchMessages();

    const channel = supabase.channel('public_chat');

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'public_chat'
      }, (payload) => {
        console.log('New message received:', payload);
        setMessages((currentMessages) => [...currentMessages, payload.new]);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'public_chat'
      }, (payload) => {
        console.log('Message deleted:', payload);
        setMessages((currentMessages) => currentMessages.filter(msg => msg.id !== payload.old.id));
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'public_chat'
      }, (payload) => {
        console.log('Message updated:', payload);
        setMessages((currentMessages) => 
          currentMessages.map(msg => msg.id === payload.new.id ? payload.new : msg)
        );
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from channel');
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.email === 'max@max.de') {
        // Refresh the session to ensure it's current
        await supabase.auth.refreshSession();
      }
    };
    checkUser();
  }, []);

  const fetchMessages = async () => {
    console.log('Nachrichten abrufen');
    const { data, error } = await supabase
      .from('public_chat')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Fehler beim Abrufen der Nachrichten:', error);
    } else {
      console.log('Nachrichten abgerufen:', data);
      setMessages(data);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      console.log('Nachricht senden:', newMessage);
      const result = await sendMessage(user.email, newMessage.trim());
      console.log('Ergebnis der gesendeten Nachricht:', result);
      setNewMessage('');
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      alert('Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const renderMessageContent = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
      }
      return part;
    });
  };

  const getDisplayName = (email) => {
    return email.split('@')[0];
  };

  const isAdmin = (email) => {
    return email === 'max@max.de' && user && user.email === 'max@max.de';
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prevMessage => prevMessage + emojiObject.emoji);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!user || !isAdmin(user.email)) {
      alert('You do not have permission to delete this message.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId, user.email);
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message. Please try again.');
      }
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message.id);
    setEditedContent(message.message);
  };

  const handleSaveEdit = async (messageId) => {
    if (!user || !isAdmin(user.email)) {
      alert('You do not have permission to edit this message.');
      return;
    }

    try {
      await updateMessage(messageId, editedContent, user.email);
      setEditingMessage(null);
      setEditedContent('');
    } catch (error) {
      console.error('Error updating message:', error);
      alert('Failed to update message. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditedContent('');
  };

  console.log('Rendern mit Nachrichten:', messages);

  return (
    <div className="chat-page">
      <h1>Öffentlicher Chat</h1>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="chat-container">
          <div className="messages-container">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message ${msg.name === user.email ? 'own-message' : ''} ${isAdmin(msg.name) ? 'admin-message' : ''}`}
              >
                <div className="message-bubble">
                  <div className="message-header">
                    <span className="message-name">
                      {getDisplayName(msg.name)}
                      {isAdmin(msg.name) && <span className="admin-icon">X</span>}
                    </span>
                    {isAdmin(user.email) && (
                      <span className="admin-actions">
                        {editingMessage === msg.id ? (
                          <>
                            <FaSave 
                              className="save-icon" 
                              onClick={() => handleSaveEdit(msg.id)} 
                            />
                            <FaTimes 
                              className="cancel-icon" 
                              onClick={handleCancelEdit} 
                            />
                          </>
                        ) : (
                          <>
                            <FaEdit 
                              className="edit-icon" 
                              onClick={() => handleEditMessage(msg)} 
                            />
                            <FaTrash 
                              className="delete-icon" 
                              onClick={() => handleDeleteMessage(msg.id)} 
                            />
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="message-content">
                    {editingMessage === msg.id ? (
                      <input
                        type="text"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="edit-message-input"
                      />
                    ) : (
                      renderMessageContent(msg.message)
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Geben Sie Ihre Nachricht ein..."
              className="message-input"
            />
            <button 
              type="button" 
              className="emoji-button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              😊
            </button>
            <button type="submit" className="send-button">
              <span className="send-icon">➤</span>
            </button>
          </form>
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="emoji-picker-container">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;