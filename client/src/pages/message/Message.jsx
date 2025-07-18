import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/layout/Layout";
import "./message.scss";
import { useSearchParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useSelector } from "react-redux";
import {
  useGetChatsQuery,
  useGetChatMessagesQuery,
  useCreateChatMutation,
  useMarkChatAsReadMutation,
  useUploadChatFileMutation,
} from "../../services/api/chat/chatApi";
import { useGetFriendsQuery } from "../../services/api/friendship/FriendshipApi";
import ChatList from "./ChatList";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { toast } from "react-toastify";
import { IoChatbubblesOutline } from "react-icons/io5";
import { FaTimes, FaFile, FaImage, FaVideo, FaMusic } from "react-icons/fa";

const Message = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchParams] = useSearchParams();
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [pendingFriend, setPendingFriend] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const { socket, isConnected, onlineUsers } = useSocket();
  const { user } = useSelector((state) => state.user);

  // Debug socket connection

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // RTK Query hooks
  const { data: chats = [], refetch: refetchChats } = useGetChatsQuery();
  const { data: messages = [], refetch: refetchMessages } =
    useGetChatMessagesQuery(selectedChat?.id, { skip: !selectedChat?.id });
  const { data: friendsData } = useGetFriendsQuery();
  const [createChat, { error }] = useCreateChatMutation();
  const [markAsRead] = useMarkChatAsReadMutation();
  const [uploadFile] = useUploadChatFileMutation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto select chat if friendId is in query params
  useEffect(() => {
    const friendId = searchParams.get("friendId");
    if (friendId) {
      const chat = chats.find(
        (c) => String(c.participantId) === String(friendId)
      );
      if (chat) {
        setSelectedChat(chat);
      } else {
        // For new chats from URL, set pendingFriend to trigger chat creation when message is sent
        // We need to get the friend data first
        const friends = friendsData?.friends || [];
        const friend = friends.find((f) => String(f.id) === String(friendId));
        if (friend) {
          setPendingFriend(friend);
        }
      }
    }
  }, [searchParams, chats, friendsData, createChat]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    // Join chat room when chat is selected
    if (selectedChat?.id) {
      socket.emit("joinChat", selectedChat.id);
      markAsRead(selectedChat.id);

      // Refetch messages when chat is selected
      refetchMessages();
    }

    // Listen for new messages
    socket.on("newMessage", (data) => {
      if (data.chatId === selectedChat?.id) {
        refetchMessages();
      }
      refetchChats();
    });

    // Listen for socket errors
    socket.on("error", (error) => {
      toast.error("Socket error: " + error.message);
    });

    // Listen for chat updates
    socket.on("chatUpdated", (data) => {
      refetchChats();
    });

    // Listen for typing indicators
    socket.on("userTyping", (data) => {
      if (data.chatId === selectedChat?.id) {
        setTypingUsers((prev) => new Set([...prev, data.userId]));
      }
    });

    socket.on("userStopTyping", (data) => {
      if (data.chatId === selectedChat?.id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    return () => {
      if (selectedChat?.id) {
        socket.emit("leaveChat", selectedChat.id);
      }
      socket.off("newMessage");
      socket.off("chatUpdated");
      socket.off("userTyping");
      socket.off("userStopTyping");
    };
  }, [socket, selectedChat, refetchMessages, refetchChats, markAsRead]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Filter friends based on search query
  const friends = friendsData?.friends || [];
  const filteredFriends = friends.filter(
    (friend) =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (
      (!messageInput.trim() && attachedFiles.length === 0) ||
      !socket ||
      !isConnected ||
      !user
    ) {
      return;
    }

    if (isUploading) {
      toast.info("Please wait, files are being uploaded...");
      return;
    }

    setIsUploading(true);

    try {
      // Upload files first if any
      let uploadedFiles = [];
      if (attachedFiles.length > 0) {
        const uploadPromises = attachedFiles.map(async (fileData) => {
          try {
            const result = await uploadFile(fileData.file).unwrap();
            return {
              fileUrl: result.fileUrl,
              fileName: fileData.name,
              fileType: fileData.type,
            };
          } catch (error) {
            console.error("Error uploading file:", error);
            throw new Error(`Failed to upload ${fileData.name}`);
          }
        });

        uploadedFiles = await Promise.all(uploadPromises);
      }

      // If chat already exists, send message as usual
      if (selectedChat) {
        console.log("Sending message to existing chat:", selectedChat.id);

        // Send text message if there's text content
        if (messageInput.trim()) {
          socket.emit("sendMessage", {
            chatId: selectedChat.id,
            content: messageInput.trim(),
            messageType: "text",
          });
        }

        // Send file messages if there are uploaded files
        for (const fileData of uploadedFiles) {
          socket.emit("sendMessage", {
            chatId: selectedChat.id,
            content: fileData.fileName,
            messageType: fileData.fileType.startsWith("image/")
              ? "image"
              : fileData.fileType.startsWith("video/")
              ? "video"
              : fileData.fileType.startsWith("audio/")
              ? "audio"
              : "file",
            fileUrl: fileData.fileUrl,
          });
        }

        setMessageInput("");
        setAttachedFiles([]);
        socket.emit("stopTyping", { chatId: selectedChat.id });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        return;
      }

      // If chat does not exist but pendingFriend exists, create chat and send message after
      if (pendingFriend) {
        // Ensure participantId is defined
        if (!pendingFriend.id) {
          toast.error(
            "No participantId found for pendingFriend! Check console for details."
          );
          return;
        }
        try {
          const result = await createChat({ participantId: pendingFriend.id });
          if (result.error) {
            alert("Create chat failed: " + JSON.stringify(result.error));
            return;
          }
          let chatId = null;
          let newChat = null;

          if (result.data && result.data.id) {
            chatId = result.data.id;
            newChat = result.data;
          } else if (result.data && result.data._id) {
            chatId = result.data._id;
            newChat = result.data;
          } else {
            // fallback: refetch chats and find the new one

            const refreshed = await refetchChats();
            newChat = (refreshed.data || []).find(
              (chat) =>
                chat.participantId &&
                chat.participantId.toString() === pendingFriend.id.toString()
            );
            if (newChat) {
              chatId = newChat.id;
            }
          }

          if (chatId && newChat) {
            // Set the selected chat first
            setSelectedChat(newChat);
            setPendingFriend(null);

            // Join the chat room
            socket.emit("joinChat", chatId);

            // Small delay to ensure socket events are processed
            setTimeout(() => {
              // Send text message if there's text content
              if (messageInput.trim()) {
                socket.emit("sendMessage", {
                  chatId,
                  content: messageInput.trim(),
                  messageType: "text",
                });
              }

              // Send file messages if there are uploaded files
              for (const fileData of uploadedFiles) {
                socket.emit("sendMessage", {
                  chatId,
                  content: fileData.fileName,
                  messageType: fileData.fileType.startsWith("image/")
                    ? "image"
                    : fileData.fileType.startsWith("video/")
                    ? "video"
                    : fileData.fileType.startsWith("audio/")
                    ? "audio"
                    : "file",
                  fileUrl: fileData.fileUrl,
                });
              }

              setMessageInput("");
              setAttachedFiles([]);
              socket.emit("stopTyping", { chatId });
              if (typingTimeoutRef.current)
                clearTimeout(typingTimeoutRef.current);
            }, 100);
          } else {
            // Clear the pending friend if chat creation failed
            setPendingFriend(null);
          }
        } catch (error) {
          toast.error("Error creating chat and sending message:", error);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message: " + error.message);
    } finally {
      setIsUploading(false);
    }

    // If chat does not exist but pendingFriend exists, create chat and send message after
    if (pendingFriend) {
      // Ensure participantId is defined
      if (!pendingFriend.id) {
        toast.error(
          "No participantId found for pendingFriend! Check console for details."
        );
        return;
      }
      try {
        const result = await createChat({ participantId: pendingFriend.id });
        if (result.error) {
          alert("Create chat failed: " + JSON.stringify(result.error));
          return;
        }
        let chatId = null;
        let newChat = null;

        if (result.data && result.data.id) {
          chatId = result.data.id;
          newChat = result.data;
        } else if (result.data && result.data._id) {
          chatId = result.data._id;
          newChat = result.data;
        } else {
          // fallback: refetch chats and find the new one

          const refreshed = await refetchChats();
          newChat = (refreshed.data || []).find(
            (chat) =>
              chat.participantId &&
              chat.participantId.toString() === pendingFriend.id.toString()
          );
          if (newChat) {
            chatId = newChat.id;
          }
        }

        if (chatId && newChat) {
          // Set the selected chat first
          setSelectedChat(newChat);
          setPendingFriend(null);

          // Join the chat room
          socket.emit("joinChat", chatId);

          // Small delay to ensure socket events are processed
          setTimeout(() => {
            socket.emit("sendMessage", {
              chatId,
              content: messageInput.trim(),
              messageType: "text",
            });
            setMessageInput("");
            socket.emit("stopTyping", { chatId });
            if (typingTimeoutRef.current)
              clearTimeout(typingTimeoutRef.current);
          }, 100);
        } else {
          // Clear the pending friend if chat creation failed
          setPendingFriend(null);
        }
      } catch (error) {
        toast.error("Error creating chat and sending message:", error);
      }
    }
  };

  // Helper function to get file type icon
  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return <FaImage />;
    if (fileType.startsWith("video/")) return <FaVideo />;
    if (fileType.startsWith("audio/")) return <FaMusic />;
    return <FaFile />;
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Helper function to create file preview
  const createFilePreview = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          id: Date.now() + Math.random(),
          file,
          preview: e.target.result,
          name: file.name,
          size: file.size,
          type: file.type,
          icon: getFileIcon(file.type),
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAttach = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      // Create previews for all valid files
      const filePreviews = await Promise.all(
        validFiles.map((file) => createFilePreview(file))
      );

      setAttachedFiles((prev) => [...prev, ...filePreviews]);
      toast.success(`${validFiles.length} file(s) attached successfully`);
    } catch (error) {
      console.error("Error creating file previews:", error);
      toast.error("Error attaching files");
    }

    // Clear the input
    e.target.value = "";
  };

  const removeAttachedFile = (fileId) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    // Emit typing indicator only if we have a selected chat
    if (socket && selectedChat) {
      socket.emit("typing", { chatId: selectedChat.id });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { chatId: selectedChat.id });
      }, 1000);
    }
  };

  const handleBack = () => {
    setSelectedChat(null);
    setTypingUsers(new Set());
    setShowSearchResults(false);
    setSearchQuery("");
    setPendingFriend(null);
    setAttachedFiles([]);
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setTypingUsers(new Set());
    setShowSearchResults(false);
    setSearchQuery("");
    setPendingFriend(null);
    setAttachedFiles([]);
    if (socket) {
      socket.emit("joinChat", chat.id);
      markAsRead(chat.id);
    }
  };

  const handleFriendSelect = async (friend) => {
    setSearchQuery("");
    setShowSearchResults(false);
    setPendingFriend(friend);
    setAttachedFiles([]);

    // Find existing chat with this friend
    const existingChat = chats.find(
      (chat) =>
        chat.participantId &&
        chat.participantId.toString() === friend.id.toString()
    );

    if (existingChat) {
      setSelectedChat(existingChat);
      setTypingUsers(new Set());
      setPendingFriend(null);
      if (socket) {
        socket.emit("joinChat", existingChat.id);
        markAsRead(existingChat.id);
      }
      return;
    }

    // For new chats, just set pendingFriend and let handleSendMessage handle the creation
    // This ensures the chat is created only when the user actually sends a message
    setPendingFriend(friend);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const handleSearchFocus = () => {
    if (searchQuery.length > 0) {
      setShowSearchResults(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding search results to allow clicking on items
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  // Check if selected chat has messages
  const hasMessages = messages && messages.length > 0;

  // Render logic: show chat panel if selectedChat or pendingFriend exists
  const showChatPanel = selectedChat || pendingFriend;
  const chatUser = selectedChat || pendingFriend;
  const chatUserId = chatUser?.participantId || chatUser?.id;
  const isChatOnline = chatUserId && onlineUsers.has(chatUserId);

  return (
    <Layout>
      <div className='message-container'>
        {isMobile ? (
          showChatPanel ? (
            <div className='chat-history'>
              <ChatHeader
                user={chatUser}
                isMobile={true}
                onBack={handleBack}
                online={isChatOnline}
              />
              <ChatMessages
                messages={messages}
                hasMessages={selectedChat && hasMessages}
                typingUsers={typingUsers}
                user={chatUser}
                messagesEndRef={messagesEndRef}
              />
              <ChatInput
                messageInput={messageInput}
                onInputChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onSend={handleSendMessage}
                onAttach={handleAttach}
                attachedFiles={attachedFiles}
                onRemoveFile={removeAttachedFile}
                isUploading={isUploading}
                disabled={!(selectedChat || pendingFriend)}
              />
            </div>
          ) : (
            <ChatList
              chats={chats}
              filteredFriends={filteredFriends}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchFocus={handleSearchFocus}
              onSearchBlur={handleSearchBlur}
              onFriendSelect={handleFriendSelect}
              onChatSelect={handleChatSelect}
              selectedChat={selectedChat}
              showSearchResults={showSearchResults}
              onlineUsers={onlineUsers}
            />
          )
        ) : (
          <>
            <ChatList
              chats={chats}
              filteredFriends={filteredFriends}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchFocus={handleSearchFocus}
              onSearchBlur={handleSearchBlur}
              onFriendSelect={handleFriendSelect}
              onChatSelect={handleChatSelect}
              selectedChat={selectedChat}
              showSearchResults={showSearchResults}
              onlineUsers={onlineUsers}
            />
            <div className='chat-history'>
              {showChatPanel ? (
                <>
                  <ChatHeader
                    user={chatUser}
                    isMobile={false}
                    onBack={handleBack}
                    online={isChatOnline}
                  />
                  <ChatMessages
                    messages={messages}
                    hasMessages={selectedChat && hasMessages}
                    typingUsers={typingUsers}
                    user={chatUser}
                    messagesEndRef={messagesEndRef}
                  />
                  <ChatInput
                    messageInput={messageInput}
                    onInputChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onSend={handleSendMessage}
                    onAttach={handleAttach}
                    attachedFiles={attachedFiles}
                    onRemoveFile={removeAttachedFile}
                    isUploading={isUploading}
                    disabled={!(selectedChat || pendingFriend)}
                  />
                </>
              ) : (
                <div className='no-chat-selected'>
                  <div className='no-chat-content'>
                    <span>
                      <IoChatbubblesOutline />
                    </span>
                    <h3>Select a conversation</h3>
                    <p>Choose a chat from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Message;
