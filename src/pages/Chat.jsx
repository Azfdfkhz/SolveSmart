import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onSnapshot, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; // pastikan sudah setup Firestore
import { useAuth } from "../context/AuthContext";
import { FaHome, FaComments, FaRobot, FaUser, FaPaperPlane } from "react-icons/fa";

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  // 🔥 Realtime listener Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "messages"), (snapshot) => {
      const msgs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.timestamp - b.timestamp);
      setMessages(msgs);
    });
    return unsub;
  }, []);

  // 🔽 Scroll otomatis ke bawah tiap pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✉️ Kirim pesan
  const sendMessage = async () => {
    if (inputMessage.trim() === "") return;

    await addDoc(collection(db, "messages"), {
      text: inputMessage,
      sender: user?.displayName || "Guest",
      uid: user?.uid || "unknown",
      timestamp: serverTimestamp(),
    });

    setInputMessage("");
  };

  // 🖱 Enter untuk kirim
  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md md:max-w-3xl lg:max-w-4xl">
        {/* Main Chat Container */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-3xl shadow-2xl p-4 border-4 border-blue-900 flex flex-col h-[85vh]">
          {/* Header */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-3 mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-indigo-600 rounded-full"></div>
              </div>
              <h1 className="text-sm font-semibold text-white">
                Solve Smart Company Chat
              </h1>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-white rounded-3xl p-4 overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.uid === user?.uid ? "justify-end" : "justify-start"
                }`}
              >
                {msg.uid !== user?.uid && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <FaUser className="text-gray-600" />
                  </div>
                )}
                <div
                  className={`px-4 py-2 max-w-[70%] rounded-2xl text-sm shadow ${
                    msg.uid === user?.uid
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="mt-3 flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tulis pesan..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition shadow-lg"
            >
              <FaPaperPlane className="text-white text-lg" />
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-4 bg-white rounded-full shadow-xl px-6 py-3">
          <div className="flex items-center justify-around">
            <button
              onClick={() => navigate("/home")}
              className="flex flex-col items-center group"
            >
              <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition shadow-lg">
                <FaHome className="text-xl" />
              </div>
            </button>
            <button className="flex flex-col items-center group">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center group-hover:bg-blue-600 transition shadow-lg">
                <FaComments className="text-xl" />
              </div>
            </button>
            <button className="flex flex-col items-center group">
              <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition">
                <FaRobot className="text-xl" />
              </div>
            </button>
            <button className="flex flex-col items-center group">
              <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition">
                <FaUser className="text-xl" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
