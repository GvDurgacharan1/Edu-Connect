import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageSquare, FiSend, FiPaperclip, FiSearch, FiSmile,
  FiTrash2, FiClock, FiCheck, FiCheckCircle, FiFileText, FiX,
  FiImage, FiFile, FiDownload, FiUser, FiInfo
} from 'react-icons/fi';

const EMOJIS = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🫣', '🤭', '🤫', '🤥', '😶', '😶‍🌫️', '😐', '😑', '😬', '🫨', '🫠', '🤥', '🤝', '👍', '👎', '👏', '🙌', '💡', '🔥', '📚', '🎓', '📝', '💻'];

export const ChatPage = () => {
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();
  const { showToast } = useNotifications();

  // Active Conversations & contacts
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null); // the user we talk to
  const [loadingContacts, setLoadingContacts] = useState(true);

  // Message Lists & state
  const [messages, setMessages] = useState([]);
  const [messageSearch, setMessageSearch] = useState('');
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [recipientTyping, setRecipientTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Emoji & file toggles
  const [emojiDrawerOpen, setEmojiDrawerOpen] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  
  // Chat Room reference for autoscroll
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchChatContacts();
  }, []);

  // Listen to incoming messages via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      // If message is from the active selected contact, add to list and mark read
      if (selectedContact && msg.sender === selectedContact.user?._id) {
        setMessages((prev) => [...prev, msg]);
        socket.emit('markAsRead', {
          chatId: msg.chatId,
          senderId: selectedContact.user?._id,
          readerId: user._id
        });
      }
    };

    const handleTypingEvent = (data) => {
      // data: { senderId, isTyping }
      if (selectedContact && data.senderId === selectedContact.user?._id) {
        setRecipientTyping(data.isTyping);
      }
    };

    const handleReadReceipt = (data) => {
      // data: { readerId, chatId }
      if (selectedContact && data.readerId === selectedContact.user?._id) {
        setMessages((prev) =>
          prev.map((m) => (m.receiver === selectedContact.user?._id ? { ...m, isRead: true } : m))
        );
      }
    };

    const handleStatusUpdate = (data) => {
      // data: { messageId, status }
      if (data.status === 'delivered') {
        setMessages((prev) =>
          prev.map((m) => (m._id === data.messageId ? { ...m, delivered: true } : m))
        );
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('typing', handleTypingEvent);
    socket.on('readReceipt', handleReadReceipt);
    socket.on('messageStatusUpdate', handleStatusUpdate);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('typing', handleTypingEvent);
      socket.off('readReceipt', handleReadReceipt);
      socket.off('messageStatusUpdate', handleStatusUpdate);
    };
  }, [socket, selectedContact]);

  // Autoscroll whenever messages update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, recipientTyping]);

  // Refetch messages when selected contact changes
  useEffect(() => {
    if (selectedContact) {
      fetchConversationMessages();
      setRecipientTyping(false);
    } else {
      setMessages([]);
    }
  }, [selectedContact]);

  const fetchChatContacts = async () => {
    try {
      setLoadingContacts(true);
      const res = await api.get('/bookings');
      if (res.data.success) {
        // Filter accepted bookings only
        const accepted = res.data.bookings.filter((b) => b.status === 'Accepted');
        
        // Map to contacts list (resolved profiles of teachers/students)
        const contactsMap = new Map();
        
        accepted.forEach((b) => {
          if (user.role === 'student' && b.teacher) {
            const contactUserId = typeof b.teacher.user === 'object' && b.teacher.user?._id 
              ? b.teacher.user._id 
              : b.teacher.user;
            contactsMap.set(contactUserId, {
              user: typeof b.teacher.user === 'object' ? b.teacher.user : { _id: b.teacher.user },
              fullName: b.teacher.fullName,
              avatar: b.teacher.avatar,
              role: 'teacher',
              bookingId: b._id,
              meta: b.teacher.qualification || b.teacher.university
            });
          } else if (user.role === 'teacher' && b.student) {
            const contactUserId = typeof b.student.user === 'object' && b.student.user?._id 
              ? b.student.user._id 
              : b.student.user;
            contactsMap.set(contactUserId, {
              user: typeof b.student.user === 'object' ? b.student.user : { _id: b.student.user },
              fullName: b.student.fullName,
              avatar: b.student.avatar,
              role: 'student',
              bookingId: b._id,
              meta: b.student.university || b.student.course
            });
          }
        });

        setContacts(Array.from(contactsMap.values()));
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve active contacts.', 'error');
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchConversationMessages = async () => {
    if (!selectedContact) return;
    try {
      setLoadingMessages(true);
      const params = messageSearch ? { search: messageSearch } : {};
      const res = await api.get(`/chat/messages/${selectedContact.user?._id}`, { params });
      if (res.data.success) {
        setMessages(res.data.messages);
        
        // Notify socket that we read these messages
        if (socket && res.data.messages.length > 0) {
          const lastMsg = res.data.messages[res.data.messages.length - 1];
          socket.emit('markAsRead', {
            chatId: lastMsg.chatId,
            senderId: selectedContact.user?._id,
            readerId: user._id
          });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch messages:', err.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleTypingChange = (e) => {
    setInputText(e.target.value);

    if (!socket || !selectedContact) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', {
        senderId: user._id,
        receiverId: selectedContact.user?._id,
        isTyping: true
      });
    }

    // Debounce typing indicator off
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit('typing', {
        senderId: user._id,
        receiverId: selectedContact.user?._id,
        isTyping: false
      });
    }, 2000);
  };

  const handleEmojiClick = (emoji) => {
    setInputText((prev) => prev + emoji);
    setEmojiDrawerOpen(false);
  };

  const handleRemoveAttachment = (idx) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Delete message for you?')) return;
    try {
      const res = await api.delete(`/chat/message/${msgId}`);
      if (res.data.success) {
        setMessages(prev => prev.filter(m => m._id !== msgId));
      }
    } catch (err) {
      showToast('Error', 'Failed to delete message.', 'error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && attachmentFiles.length === 0) return;

    const formData = new FormData();
    formData.append('receiverId', selectedContact.user?._id);
    formData.append('text', inputText);
    
    if (attachmentFiles.length > 0) {
      attachmentFiles.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    // Optimistically clean values
    setInputText('');
    setAttachmentFiles([]);
    setEmojiDrawerOpen(false);

    try {
      const res = await api.post('/chat/message', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        const newMsg = res.data.message;
        setMessages((prev) => [...prev, newMsg]);

        // Send real-time packet via socket
        if (socket) {
          socket.emit('sendMessage', newMsg);
        }
      }
    } catch (err) {
      showToast('Send Failed', 'Failed to dispatch message.', 'error');
    }
  };

  return (
    <div className="h-[80vh] flex rounded-3xl border border-slate-200/50 dark:border-slate-800/40 overflow-hidden glass-card">
      
      {/* Sidebar - Contacts column */}
      <aside className="w-80 border-r border-slate-200/50 dark:border-slate-800/35 flex flex-col bg-white/20 dark:bg-slate-900/10">
        
        {/* Header Search */}
        <div className="p-4 border-b border-slate-200/40 space-y-3 text-left">
          <h3 className="font-outfit font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
            <FiMessageSquare className="text-primary w-5 h-5" />
            <span>Class Mentorship Chats</span>
          </h3>
          
          <div className="relative text-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={messageSearch}
              onChange={(e) => setMessageSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchConversationMessages()}
              placeholder="Search chat keywords..."
              className="w-full pl-8 pr-3 py-2 rounded-lg glass-input text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Contacts lists */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingContacts ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-14 skeleton rounded-xl mx-2" />
            ))
          ) : contacts.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              <p>No active chats yet.</p>
              <p className="text-[10px] mt-1 text-slate-450 leading-relaxed">
                Chat unlocks automatically once a student booking request is accepted by the professor.
              </p>
            </div>
          ) : (
            contacts.map((contact) => {
              const active = selectedContact?.user?._id === contact.user?._id;
              const onlineStatus = isOnline(contact.user?._id || contact.user);
              return (
                <div
                  key={contact.user?._id || contact.user}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer text-left transition-colors ${
                    active
                      ? 'bg-primary text-white shadow-md'
                      : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 relative bg-slate-200 border border-slate-200/20">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-accent text-white font-bold text-xs uppercase">
                        {contact.fullName?.[0]}
                      </div>
                    )}
                    {onlineStatus && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs truncate">
                      {contact.fullName}
                    </h4>
                    <p className={`text-[10px] truncate ${active ? 'text-white/80' : 'text-slate-500'}`}>
                      {contact.meta}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Conversation Pane */}
      <section className="flex-1 flex flex-col justify-between bg-white/10 dark:bg-slate-950/20 relative">
        
        {selectedContact ? (
          <>
            {/* Header info */}
            <div className="h-14 border-b border-slate-200/50 dark:border-slate-800/35 flex items-center justify-between px-6 bg-white/30 dark:bg-slate-900/10">
              <div className="text-left flex items-center gap-2">
                <h3 className="font-outfit font-black text-sm text-slate-800 dark:text-slate-200">
                  Conversation with {selectedContact.fullName}
                </h3>
                <span className={`w-2 h-2 rounded-full ${isOnline(selectedContact.user?._id) ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span className="text-[10px] text-slate-400 capitalize">
                  ({selectedContact.role})
                </span>
              </div>

              {/* Reset selections button */}
              <button
                onClick={() => setSelectedContact(null)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Messages box list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender === user._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div className="max-w-[70%] flex flex-col gap-1 items-end relative text-left">
                        {/* Message body */}
                        <div
                          className={`p-3 rounded-2xl text-xs relative ${
                            isOwn
                              ? 'bg-primary text-white rounded-tr-none'
                              : 'bg-slate-150 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/10'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          
                          {/* Attachments rendering */}
                          {msg.attachments?.length > 0 && (
                            <div className="space-y-1.5 mt-2 pt-2 border-t border-white/10 dark:border-slate-700/50">
                              {msg.attachments.map((file, idx) => (
                                <a
                                  key={idx}
                                  href={file.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-1.5 rounded bg-black/10 dark:bg-slate-900/50 hover:bg-black/20 text-[10px] font-semibold text-inherit truncate"
                                >
                                  {file.fileType === 'image' ? <FiImage /> : <FiFileText />}
                                  <span className="truncate max-w-[150px]">{file.fileName || 'Attachment'}</span>
                                  <FiDownload className="w-3 h-3 flex-shrink-0 ml-auto" />
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Timestamp info */}
                          <div className="flex justify-between items-center gap-2 mt-1 text-[9px] opacity-70">
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            
                            {/* Read receipts icons */}
                            {isOwn && (
                              <span className="flex items-center">
                                {msg.isRead ? (
                                  <FiCheckCircle className="text-emerald-300 w-3 h-3" />
                                ) : (
                                  <FiCheck className="w-3 h-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Hover Message delete control */}
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="opacity-0 group-hover:opacity-100 absolute top-1/2 -translate-y-1/2 p-1 rounded hover:bg-rose-500/10 text-rose-500 transition-all text-[10px]"
                          style={{ [isOwn ? 'left' : 'right']: '-28px' }}
                          title="Delete message for me"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {recipientTyping && (
                <div className="flex justify-start items-center gap-2 text-[10px] text-slate-400 font-semibold italic">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>{selectedContact.fullName} is typing...</span>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Render selected attachment file previews */}
            {attachmentFiles.length > 0 && (
              <div className="p-3 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200/50 flex flex-wrap gap-2 text-left">
                {attachmentFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded-lg border border-primary/20 bg-primary/5 text-[10px] font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300"
                  >
                    <span>{file.name}</span>
                    <button
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Form controls */}
            <div className="p-4 border-t border-slate-200/50 dark:border-slate-805 bg-white/20 dark:bg-slate-900/10 relative">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                
                {/* Emoji drawer button */}
                <button
                  type="button"
                  onClick={() => setEmojiDrawerOpen(!emojiDrawerOpen)}
                  className="p-2.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary dark:hover:text-accent transition-colors"
                >
                  <FiSmile className="w-4 h-4" />
                </button>

                {/* File attachment button */}
                <label className="p-2.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary dark:hover:text-accent cursor-pointer transition-colors">
                  <FiPaperclip className="w-4 h-4" />
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setAttachmentFiles(Array.from(e.target.files))}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={inputText}
                  onChange={handleTypingChange}
                  placeholder={`Write message to ${selectedContact.fullName}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs glass-input text-slate-800 dark:text-slate-100"
                />

                <button
                  type="submit"
                  className="p-2.5 bg-primary text-white rounded-xl shadow-md hover:bg-primary-dark transition-colors flex items-center justify-center"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </form>

              {/* Popover Emoji Drawer Grid */}
              <AnimatePresence>
                {emojiDrawerOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setEmojiDrawerOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute bottom-16 left-4 w-64 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-805 glass-card shadow-2xl z-20"
                    >
                      <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto text-lg">
                        {EMOJIS.map((emoji, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleEmojiClick(emoji)}
                            className="hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 gap-3">
            <FiMessageSquare className="w-12 h-12 text-slate-350 animate-float" />
            <div className="text-center space-y-1">
              <h3 className="font-outfit font-black text-sm text-slate-655 dark:text-slate-300">
                Mentorship Conversations Pane
              </h3>
              <p className="text-[11px] max-w-xs leading-relaxed text-slate-500">
                Select an approved contact from the left panel to begin private chat coordinates.
              </p>
            </div>
          </div>
        )}

      </section>

    </div>
  );
};

export default ChatPage;
