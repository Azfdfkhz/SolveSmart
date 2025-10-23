import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  onSnapshot, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { FaHome, FaPaperPlane, FaStore, FaSpinner, FaUser, FaExclamationTriangle, FaBars, FaArrowLeft } from "react-icons/fa";

const Chat = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/chat-monitor');
      return;
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    console.log("🟡 Setting up chat for user:", user.uid);
    setLoading(true);
    setError(null);

    let unsubscribe = null;

    const setupChatListener = async () => {
      try {
        const q = query(
          collection(db, "messages"),
          where("chatId", "==", user.uid),
          orderBy("timestamp", "asc"),
          limit(50)
        );

        unsubscribe = onSnapshot(q, 
          (snapshot) => {
            console.log("🟢 Realtime update received");
            const newMessages = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setMessages(newMessages);
            setLoading(false);
            setError(null);
          },
          (error) => {
            console.error("🔴 Indexed query failed:", error);
            
            const fallbackQ = query(
              collection(db, "messages"),
              where("chatId", "==", user.uid),
              limit(50)
            );
            
            unsubscribe = onSnapshot(fallbackQ, 
              (fallbackSnapshot) => {
                const fallbackMessages = fallbackSnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                })).sort((a, b) => {
                  try {
                    const timeA = a.timestamp?.toDate?.() || new Date(0);
                    const timeB = b.timestamp?.toDate?.() || new Date(0);
                    return timeA - timeB;
                  } catch {
                    return 0;
                  }
                });
                
                setMessages(fallbackMessages);
                setLoading(false);
                setError(" Mode fallback aktif - pesan mungkin tidak terurut sempurna");
              },
              (fallbackError) => {
                console.error("🔴 Fallback also failed:", fallbackError);
                loadMessagesOnce();
              }
            );
          }
        );
      } catch (error) {
        console.error("🔴 Setup failed:", error);
        loadMessagesOnce();
      }
    };

    const loadMessagesOnce = async () => {
      try {
        console.log("🟡 Trying one-time load...");
        const q = query(
          collection(db, "messages"),
          where("chatId", "==", user.uid),
          limit(30)
        );
        
        const snapshot = await getDocs(q);
        const initialMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => {
          try {
            const timeA = a.timestamp?.toDate?.() || new Date(0);
            const timeB = b.timestamp?.toDate?.() || new Date(0);
            return timeA - timeB;
          } catch {
            return 0;
          }
        });
        
        setMessages(initialMessages);
        setError("⚠️ Mode offline - pesan tidak realtime");
      } catch (finalError) {
        console.error("🔴 All strategies failed:", finalError);
        setError("❌ Gagal memuat pesan. Silakan refresh halaman.");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    setupChatListener();

    return () => {
      if (unsubscribe) {
        console.log("🟡 Cleaning up chat listener");
        unsubscribe();
      }
    };
  }, [user?.uid]);

  useEffect(() => {
    if (messages.length > 0 && !loading) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: "smooth",
          block: "end" 
        });
      }, 100);
    }
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || sending || !user?.uid) return;

    setSending(true);
    const messageText = inputMessage.trim();

    try {
      const tempMessage = {
        id: `temp-${Date.now()}`,
        text: messageText,
        sender: user?.displayName || user?.email?.split('@')[0] || "Pembeli",
        uid: user.uid,
        chatId: user.uid,
        timestamp: new Date(),
        type: "customer_message",
        read: false,
        customerEmail: user.email,
        customerName: user?.displayName || user?.email?.split('@')[0],
        isSending: true
      };

      setMessages(prev => [...prev, tempMessage]);
      setInputMessage("");

      const messageData = {
        text: messageText,
        sender: user?.displayName || user?.email?.split('@')[0] || "Pembeli",
        uid: user.uid,
        chatId: user.uid,
        timestamp: serverTimestamp(),
        type: "customer_message",
        read: false,
        customerEmail: user.email,
        customerName: user?.displayName || user?.email?.split('@')[0]
      };

      await addDoc(collection(db, "messages"), messageData);
      
      console.log("🟢 Message sent successfully");

    } catch (error) {
      console.error("🔴 Error sending message:", error);
      
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
    
      setError("❌ Gagal mengirim pesan. Silakan coba lagi.");
      
      setTimeout(() => setError(null), 5000);
    } finally {
      setSending(false);
    }
  }, [inputMessage, sending, user]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !sending) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return "";
    }
  };

  const formatMessageDate = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return "Hari Ini";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Kemarin";
      } else {
        return date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    } catch {
      return "";
    }
  };

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(message => {
      const dateKey = formatMessageDate(message.timestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    return groups;
  };

  // Loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FaSpinner className="w-8 h-8 animate-spin" />
          </div>
          <p className="text-lg font-semibold mb-2">Memuat Percakapan</p>
          <p className="text-blue-200 text-sm">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header - Mobile Optimized */}
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 backdrop-blur-xl border-b border-blue-500/20 p-3 sm:p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Back Button - Mobile Only */}
              <button 
                onClick={() => navigate("/home")}
                className="lg:hidden bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border border-blue-500/30 p-2 rounded-xl hover:from-blue-600/30 hover:to-cyan-600/30 transition duration-300 shadow-lg shadow-blue-900/20"
              >
                <FaArrowLeft className="text-blue-300 text-sm" />
              </button>
              
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FaStore className="text-white text-sm sm:text-lg" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Penjual</h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${onlineStatus ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <p className="text-blue-200 text-xs sm:text-sm">
                    {onlineStatus ? 'Online • Balasan cepat' : 'Offline • Balasan dalam 24 jam'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* User Info - Hidden on mobile, show on larger screens */}
              <div className="text-right hidden sm:block">
                <p className="text-white text-sm font-medium">{user?.displayName || user?.email?.split('@')[0]}</p>
                <p className="text-blue-200 text-xs">Customer</p>
              </div>
              
              {/* Home Button - Hidden on mobile, shown on larger screens */}
              <button 
                onClick={() => navigate("/home")}
                className="hidden lg:flex bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border border-blue-500/30 p-3 rounded-xl hover:from-blue-600/30 hover:to-cyan-600/30 transition duration-300 shadow-lg shadow-blue-900/20"
              >
                <FaHome className="text-blue-300 text-lg" />
              </button>

              {/* User Menu Button - Mobile */}
              <div className="relative lg:hidden">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border border-blue-500/30 p-2 rounded-xl hover:from-blue-600/30 hover:to-cyan-600/30 transition duration-300 shadow-lg shadow-blue-900/20"
                >
                  <FaUser className="text-blue-300 text-sm" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-12 bg-gradient-to-br from-slate-800 to-blue-900/80 backdrop-blur-xl border border-blue-500/30 rounded-xl p-3 shadow-lg shadow-blue-900/30 min-w-[150px]">
                    <p className="text-white text-sm font-medium mb-1">{user?.displayName || user?.email?.split('@')[0]}</p>
                    <p className="text-blue-200 text-xs mb-2">Customer</p>
                    <button 
                      onClick={() => navigate("/home")}
                      className="w-full bg-blue-600/50 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded-lg transition duration-200 flex items-center justify-center space-x-1"
                    >
                      <FaHome className="text-xs" />
                      <span>Kembali ke Home</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-orange-500/20 border-l-4 border-orange-500 p-3">
            <div className="max-w-6xl mx-auto flex items-center space-x-2">
              <FaExclamationTriangle className="text-orange-300 flex-shrink-0 text-sm" />
              <p className="text-orange-200 text-xs sm:text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Chat Area - Mobile Optimized */}
        <div className="flex-1 max-w-6xl mx-auto w-full p-2 sm:p-4 pb-20 sm:pb-24">
          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-xl border border-blue-500/20 rounded-xl sm:rounded-2xl h-[calc(100vh-180px)] sm:h-[65vh] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <FaStore className="text-blue-300 text-xl sm:text-2xl" />
                </div>
                <h3 className="text-white text-base sm:text-lg font-semibold mb-2">Mulai Percakapan</h3>
                <p className="text-blue-200/60 text-xs sm:text-sm max-w-md">
                  Selamat datang! Silakan tanyakan apa saja tentang produk kami. 
                  Tim support akan membalas pesan Anda secepatnya.
                </p>
              </div>
            ) : (
              <div className="p-2 sm:p-4 space-y-4 sm:space-y-6">
                {Object.entries(messageGroups).map(([date, dayMessages]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex justify-center my-4 sm:my-6">
                      <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-500/20 px-3 py-1 sm:px-4 sm:py-2 rounded-full">
                        <span className="text-blue-200 text-xs font-medium">
                          {date}
                        </span>
                      </div>
                    </div>

                    {/* Messages */}
                    {dayMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.uid === user.uid ? "justify-end" : "justify-start"} mb-3 sm:mb-4`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[80%] ${msg.uid === user.uid ? "order-2" : "order-1"}`}>
                          <div
                            className={`p-3 sm:p-4 rounded-2xl ${
                              msg.uid === user.uid
                                ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 rounded-br-none"
                                : "bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg shadow-slate-700/30 rounded-bl-none border border-blue-500/20"
                            } ${msg.isSending ? 'opacity-70 animate-pulse' : ''}`}
                          >
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-xs sm:text-sm">
                                  {msg.uid === user.uid ? "Anda" : "Penjual"}
                                </span>
                                {msg.isSending && (
                                  <FaSpinner className="w-3 h-3 animate-spin" />
                                )}
                              </div>
                              <span className="text-white/60 text-xs">{formatTime(msg.timestamp)}</span>
                            </div>
                            <p className="text-xs sm:text-sm leading-relaxed break-words">{msg.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area - Mobile Optimized */}
          <div className="mt-3 sm:mt-4 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 backdrop-blur-xl border border-blue-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div className="flex space-x-2 sm:space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tulis pesan Anda..."
                className="flex-1 bg-gradient-to-r from-blue-950/50 to-cyan-950/50 border border-blue-500/30 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition duration-200 text-sm sm:text-base"
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || sending}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-cyan-700 transition duration-300 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
              >
                {sending ? (
                  <FaSpinner className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <FaPaperPlane className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                )}
              </button>
            </div>
            <p className="text-blue-300/40 text-xs mt-1 sm:mt-2 text-center">
              {sending ? "Mengirim..." : "Tekan Enter untuk mengirim"}
            </p>
          </div>
        </div>

        {/* Floating Info - Hidden on mobile */}
        <div className="hidden sm:block fixed bottom-20 right-4">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 rounded-xl shadow-lg shadow-blue-600/30 backdrop-blur-xl">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-xs font-medium">Support Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
