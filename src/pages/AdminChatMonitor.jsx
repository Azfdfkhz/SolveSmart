import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  addDoc,
  serverTimestamp,
  where,
  limit,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";
import { FaHome, FaSpinner, FaExclamationTriangle, FaUser, FaStore, FaPaperPlane } from "react-icons/fa";

const AdminChatMonitor = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user && !isAdmin) {
      navigate("/home");
      return;
    }
  }, [isAdmin, navigate, user]);

  useEffect(() => {
    if (!isAdmin) return;

    console.log("🟡 Admin: Loading customers...");
    setLoading(true);
    setError(null);

    let unsubscribe = null;

    const loadCustomers = async () => {
      try {
        const q = query(
          collection(db, "messages"),
          where("type", "==", "customer_message"),
          orderBy("timestamp", "desc"),
          limit(50)
        );

        unsubscribe = onSnapshot(q, 
          (snapshot) => {
            console.log("🟢 Admin: Customers data received", snapshot.size);
            
            const usersMap = new Map();
            
            snapshot.docs.forEach((doc) => {
              const data = doc.data();
              if (data.type === "customer_message" && data.chatId && !usersMap.has(data.chatId)) {
                usersMap.set(data.chatId, {
                  uid: data.chatId,
                  name: data.customerName || "Pembeli",
                  email: data.customerEmail || "No email",
                  lastMessage: data.text,
                  lastMessageTime: data.timestamp,
                  unread: data.read === false
                });
              }
            });
            
            const customersList = Array.from(usersMap.values());
            setCustomers(customersList);
            setLoading(false);
            setError(null);
            console.log("🟢 Admin: Processed", customersList.length, "customers");
          },
          (error) => {
            console.error("🔴 Admin: Customer query failed:", error);
            
            const fallbackQ = query(
              collection(db, "messages"),
              orderBy("timestamp", "desc"),
              limit(100)
            );
            
            unsubscribe = onSnapshot(fallbackQ, 
              (fallbackSnapshot) => {
                console.log("🟡 Admin: Using fallback strategy");
                const usersMap = new Map();
                
                fallbackSnapshot.docs.forEach((doc) => {
                  const data = doc.data();
                  if (data.chatId && data.type === "customer_message" && !usersMap.has(data.chatId)) {
                    usersMap.set(data.chatId, {
                      uid: data.chatId,
                      name: data.customerName || "Pembeli",
                      email: data.customerEmail || "No email",
                      lastMessage: data.text,
                      lastMessageTime: data.timestamp,
                      unread: data.read === false
                    });
                  }
                });
                
                const customersList = Array.from(usersMap.values());
                setCustomers(customersList);
                setLoading(false);
                setError(" Mode fallback aktif - data mungkin tidak lengkap");
              },
              (fallbackError) => {
                console.error("🔴 Admin: Fallback also failed:", fallbackError);
                
                loadCustomersOnce();
              }
            ); 
          }
        );
      } catch (error) {
        console.error("🔴 Admin: Setup failed:", error);
        loadCustomersOnce();
      }
    };

    const loadCustomersOnce = async () => {
      try {
        console.log("🟡 Admin: Trying one-time load...");
        const q = query(
          collection(db, "messages"),
          limit(30)
        );
        
        const snapshot = await getDocs(q);
        const usersMap = new Map();
        
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.chatId && data.type === "customer_message" && !usersMap.has(data.chatId)) {
            usersMap.set(data.chatId, {
              uid: data.chatId,
              name: data.customerName || "Pembeli",
              email: data.customerEmail || "No email",
              lastMessage: data.text,
              lastMessageTime: data.timestamp,
              unread: data.read === false
            });
          }
        });
        
        const customersList = Array.from(usersMap.values());
        setCustomers(customersList);
        setError("⚠️ Mode offline - data tidak realtime");
      } catch (finalError) {
        console.error("🔴 Admin: All strategies failed:", finalError);
        setError("❌ Gagal memuat data pelanggan. Silakan refresh halaman.");
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();

    return () => {
      if (unsubscribe) {
        console.log("🟡 Admin: Cleaning up customer listener");
        unsubscribe();
      }
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedCustomer) {
      setMessages([]);
      return;
    }

    console.log("🟡 Admin: Loading messages for:", selectedCustomer.uid);
    setMessagesLoading(true);

    let unsubscribe = null;

    const loadCustomerMessages = async () => {
      try {
        const q = query(
          collection(db, "messages"),
          where("chatId", "==", selectedCustomer.uid),
          orderBy("timestamp", "asc")
        );

        unsubscribe = onSnapshot(q, 
          (snapshot) => {
            console.log("🟢 Admin: Messages update for", selectedCustomer.uid);
            const newMessages = snapshot.docs.map((doc) => ({ 
              id: doc.id, 
              ...doc.data() 
            }));
            setMessages(newMessages);
            setMessagesLoading(false);
          },
          (error) => {
            console.error("🔴 Admin: Message query failed:", error);
            
            const fallbackQ = query(
              collection(db, "messages"),
              where("chatId", "==", selectedCustomer.uid)
            );
            
            unsubscribe = onSnapshot(fallbackQ, 
              (fallbackSnapshot) => {
                const fallbackMessages = fallbackSnapshot.docs.map((doc) => ({ 
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
                setMessagesLoading(false);
              }
            );
          }
        );
      } catch (error) {
        console.error("🔴 Admin: Message setup failed:", error);
        setMessagesLoading(false);
      }
    };

    loadCustomerMessages();

    return () => {
      if (unsubscribe) {
        console.log("🟡 Admin: Cleaning up message listener");
        unsubscribe();
      }
    };
  }, [selectedCustomer]);

  const sendReply = useCallback(async () => {
    if (!replyMessage.trim() || sending || !selectedCustomer) return;
    
    setSending(true);
    try {
      const tempMessage = {
        id: `temp-${Date.now()}`,
        text: replyMessage.trim(),
        sender: "Penjual",
        uid: "seller",
        chatId: selectedCustomer.uid,
        timestamp: new Date(),
        type: "seller_reply",
        read: true,
        isSending: true
      };

      setMessages(prev => [...prev, tempMessage]);
      
      await addDoc(collection(db, "messages"), {
        text: replyMessage.trim(),
        sender: "Penjual",
        uid: "seller",
        chatId: selectedCustomer.uid,
        timestamp: serverTimestamp(),
        type: "seller_reply",
        read: true,
      });
      
      setReplyMessage("");
      console.log("🟢 Admin: Reply sent successfully");
    } catch (e) {
      console.error("🔴 Admin: Send message error:", e);
      setMessages(prev => prev.filter(msg => !msg.isSending));
      alert("Gagal mengirim pesan.");
    } finally {
      setSending(false);
    }
  }, [replyMessage, sending, selectedCustomer]);

  const formatTime = useCallback((t) => {
    if (!t) return "";
    try {
      const d = t.toDate();
      return d.toLocaleTimeString('id-ID', { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }, []);

  const formatDate = useCallback((t) => {
    if (!t) return "";
    try {
      const d = t.toDate();
      return d.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return "";
    }
  }, []);

  // Loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaSpinner className="w-8 h-8 animate-spin" />
          </div>
          <p className="text-lg font-semibold mb-2">Memuat Data Pelanggan</p>
          <p className="text-blue-200 text-sm">Sedang mengambil percakapan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-900/20"></div>

      <div className="relative z-10 min-h-screen p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {selectedCustomer ? `Chat dengan ${selectedCustomer.name}` : "Admin Chat Monitor"}
            </h1>
            <p className="text-blue-200/60 text-sm">
              {selectedCustomer ? "Kelola percakapan dengan pelanggan" : `${customers.length} pelanggan ditemukan`}
            </p>
          </div>
          
          <button 
            onClick={() => selectedCustomer ? setSelectedCustomer(null) : navigate("/home")} 
            className="bg-blue-600/20 border border-blue-500/30 px-4 py-2 rounded-xl text-blue-300 hover:bg-blue-600/30 transition flex items-center space-x-2"
          >
            <FaHome className="text-sm" />
            <span>{selectedCustomer ? "Kembali" : "Home"}</span>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-orange-500/20 border-l-4 border-orange-500 p-3 mb-4 rounded">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="text-orange-300 flex-shrink-0" />
              <p className="text-orange-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {!selectedCustomer ? (
          // Customer List
          <div className="grid gap-3">
            {customers.length === 0 ? (
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-8 text-center">
                <FaStore className="text-blue-300 text-4xl mx-auto mb-3" />
                <p className="text-blue-200/60 text-lg">Belum ada pesan dari pelanggan</p>
                <p className="text-blue-200/40 text-sm mt-1">Pesan dari pelanggan akan muncul di sini</p>
              </div>
            ) : (
              customers.map((customer) => (
                <div
                  key={customer.uid}
                  className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl hover:bg-blue-900/30 cursor-pointer transition group"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                          <FaUser className="text-white" />
                        </div>
                        {customer.unread && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-blue-900"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold text-white text-lg">{customer.name}</p>
                          {customer.unread && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Baru</span>
                          )}
                        </div>
                        <p className="text-blue-200/60 text-sm mb-1">{customer.email}</p>
                        {customer.lastMessage && (
                          <p className="text-blue-200/70 text-sm line-clamp-1">
                            {customer.lastMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {customer.lastMessageTime && (
                        <p className="text-xs text-blue-300/50 mb-2">
                          {formatDate(customer.lastMessageTime)}
                        </p>
                      )}
                      <div className="text-blue-400 group-hover:text-blue-300 transition">
                        <FaPaperPlane className="text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Chat Interface
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl overflow-hidden shadow-lg">
              
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-b border-blue-500/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaUser className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-lg">{selectedCustomer.name}</p>
                      <p className="text-blue-200/60 text-sm">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-200/60 text-sm">Status: Online</p>
                    <p className="text-blue-200/40 text-xs">ID: {selectedCustomer.uid.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="p-4 h-96 overflow-y-auto bg-blue-950/10">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FaSpinner className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
                      <p className="text-blue-200/60 text-sm">Memuat pesan...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <FaStore className="text-blue-300/30 text-4xl mb-2" />
                    <p className="text-blue-200/40">Belum ada pesan dalam percakapan ini</p>
                    <p className="text-blue-200/20 text-sm mt-1">Mulai percakapan dengan pelanggan</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.uid === "seller" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] ${message.uid === "seller" ? "order-2" : "order-1"}`}>
                          <div
                            className={`p-3 rounded-xl ${
                              message.uid === "seller" 
                                ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg rounded-br-none" 
                                : "bg-slate-700 text-white shadow-lg rounded-bl-none border border-blue-500/20"
                            } ${message.isSending ? 'opacity-70 animate-pulse' : ''}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <p className="text-xs font-semibold opacity-80">
                                  {message.uid === "seller" ? "Anda (Penjual)" : selectedCustomer.name}
                                </p>
                                {message.isSending && (
                                  <FaSpinner className="w-3 h-3 animate-spin" />
                                )}
                              </div>
                              <p className="text-xs opacity-60">{formatTime(message.timestamp)}</p>
                            </div>
                            <p className="text-sm">{message.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-blue-500/20 bg-blue-900/30">
                <div className="flex space-x-3">
                  <input
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()}
                    placeholder="Ketik balasan untuk pelanggan..."
                    className="flex-1 bg-blue-950/50 border border-blue-500/30 rounded-xl px-4 py-3 text-white placeholder-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                    disabled={sending || messagesLoading}
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !replyMessage.trim() || messagesLoading}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[50px]"
                  >
                    {sending ? (
                      <FaSpinner className="w-4 h-4 animate-spin" />
                    ) : (
                      <FaPaperPlane className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-blue-300/40 text-xs mt-2 text-center">
                  {sending ? "Mengirim..." : "Tekan Enter untuk mengirim"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatMonitor;