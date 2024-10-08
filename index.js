require("dotenv").config();
const io = require("socket.io")(8800, {
  cors: {
    origin: "https://yuvrajtharu11.netlify.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  console.log("A user connected");
  //add new User
  socket.on("new-user-add", (newUserId) => {
    //if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id,
      });
    }
    // console.log("Connected Users", activeUsers);
    io.emit("get-users", activeUsers);
  });

  // send message
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    console.log("Sending from socket to :", receiverId);
    // console.log("Data: ", data);
    if (user) {
      io.to(user.socketId).emit("receive-message", data);
    }
  });
  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    // console.log("user disconnected", activeUsers);
    io.emit("get-users", activeUsers);
  });
});
