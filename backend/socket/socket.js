// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();

// const server = http.createServer(app);
// const io = new Server(server, {
// 	cors: {
// 		origin: ["http://localhost:3000"],
// 		methods: ["GET", "POST"],
// 	},
// });

// export const getReceiverSocketId = (receiverId) => {
// 	return userSocketMap[receiverId];
// };

// const userSocketMap = {}; // {userId: socketId}

// io.on("connection", (socket) => {
// 	console.log("a user connected", socket.id);

// 	const userId = socket.handshake.query.userId;
// 	if (userId != "undefined") userSocketMap[userId] = socket.id;

// 	// io.emit() is used to send events to all the connected clients
// 	io.emit("getOnlineUsers", Object.keys(userSocketMap));

// 	// socket.on() is used to listen to the events. can be used both on client and server side
// 	socket.on("disconnect", () => {
// 		console.log("user disconnected", socket.id);
// 		delete userSocketMap[userId];
// 		io.emit("getOnlineUsers", Object.keys(userSocketMap));
// 	});
// });

// export { app, io, server };

import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Set the allowed origin to your production URL
const allowedOrigin = "https://textify-chat-app.onrender.com";

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
  },
  // Add these options for better connection handling
  pingTimeout: 60000,
  pingInterval: 25000,
});

const userSocketMap = {}; // {userId: socketId}

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket ${socket.id}`);
  }

  // Emit online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    // Find and remove the disconnected user from userSocketMap
    const disconnectedUserId = Object.keys(userSocketMap).find(
      key => userSocketMap[key] === socket.id
    );
    if (disconnectedUserId) {
      delete userSocketMap[disconnectedUserId];
      console.log(`User ${disconnectedUserId} disconnected`);
    }
    // Emit updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Handle connection errors
  socket.on("connect_error", (err) => {
    console.log(`Connection error: ${err.message}`);
  });
});

// Log when the server starts listening
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

export { app, io, server };
