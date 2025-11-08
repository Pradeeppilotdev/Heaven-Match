import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LiveChatWidget from '../components/LiveChatWidget';
import './ChatPage.css';

const ChatPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const existingLink = document.querySelector('link[data-font-awesome="true"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
      link.integrity = 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==';
      link.crossOrigin = 'anonymous';
      link.referrerPolicy = 'no-referrer';
      link.setAttribute('data-font-awesome', 'true');
      document.head.appendChild(link);
    }
  }, []);

  const handleFormFill = (info) => {
    try {
      sessionStorage.setItem('chatSupportFormData', JSON.stringify(info));
    } catch (error) {
      console.warn('Unable to persist chat form data', error);
    }
    navigate('/contact');
  };

  return (
    <div className="chat-page">
      <div className="chat-page__content">
        <div className="chat-page__widget">
          <LiveChatWidget
            mode="embedded"
            onFormFill={handleFormFill}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

