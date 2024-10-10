import React, { useState, useEffect } from 'react';
import { supabase, sendMessage, deleteMessage, updateMessage } from '../supabaseClient';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Link } from 'react-router-dom';

const ADMIN_EMAIL = '100x@maximilian.business';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  const { subscription } = useSubscription();

  const hasActiveSubscription = subscription && subscription.subscription_status === 'active';
  const isAdmin = user && user.email === ADMIN_EMAIL;

  useEffect(() => {
    // Get the current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('public_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'public_chat' }, payload => {
        setMessages(currentMessages => [...currentMessages, payload.new]);
      })
      .subscribe();

    // Fetch initial messages
    fetchMessages();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('public_chat')
      .select('*')
      .order('date', { ascending: true });

    if (error) console.error('Error fetching messages:', error);
    else setMessages(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const messageData = {
        name: user.email,
        message: newMessage
      };
      await sendMessage(messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEdit = (msg) => {
    setEditingMessage(msg);
    setNewMessage(msg.message);
  };

  const handleUpdate = async () => {
    if (!editingMessage || !newMessage.trim()) return;

    try {
      await updateMessage(editingMessage.id, newMessage);
      setMessages(messages.map(msg => 
        msg.id === editingMessage.id ? {...msg, message: newMessage} : msg
      ));
      setEditingMessage(null);
      setNewMessage('');
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id);
      setMessages(messages.filter(msg => msg.id !== id));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatName = (email) => {
    if (email === ADMIN_EMAIL) return 'Max';
    return email.split('@')[0];
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-page">
      <h1>Öffentlicher Chat</h1>
      {!hasActiveSubscription ? (
        <div className="upgrade-overlay">
          <div className="upgrade-message">
            <h2>Upgrade erforderlich</h2>
            <p>Um auf den Chat zugreifen zu können, benötigen Sie ein aktives Abonnement.</p>
            <a href="https://projekt100x.de/mitgliedschaft-waehlen/" className="upgrade-button">Jetzt upgraden</a>
          </div>
        </div>
      ) : (
        <div className="chat-container">
          <div className="messages-container">
            {messages.map((msg) => {
              const isOwnMessage = msg.name === user.email;
              return (
                <div key={msg.id} className={`message-wrapper ${isOwnMessage ? 'own-message' : 'other-message'}`}>
                  <div className={`message ${msg.name === ADMIN_EMAIL ? 'admin-message' : ''}`}>
                    <div className="message-bubble">
                      <div className="message-header">
                        <span className="message-name">{formatName(msg.name)}</span>
                      </div>
                      <div className="message-content">
                        {msg.message}
                      </div>
                    </div>
                    <div className="message-actions">
                      {(isAdmin || isOwnMessage) && (
                        <>
                          <button onClick={() => handleEdit(msg)}>Edit</button>
                          <button onClick={() => handleDelete(msg.id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <form className="message-form" onSubmit={editingMessage ? handleUpdate : handleSubmit}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={editingMessage ? "Edit your message..." : "Nachricht eingeben..."}
              className="message-input"
            />
            <button type="submit" className="send-button">
              <span className="send-icon">{editingMessage ? '✓' : '➤'}</span>
            </button>
            {editingMessage && (
              <button type="button" onClick={() => setEditingMessage(null)} className="cancel-button">
                Cancel
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;