import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.emit("joinRoom", { roomId: "room1" });

socket.on("receiveMessage", (msg) => {
  console.log("New message:", msg);
});

setTimeout(() => {
  socket.emit("sendMessage", {
    roomId: "room1",
    product_id: "66f123...",
    from_user: 1,
    to_farmer: 2,
    content: "Hello Farmer!"
  });
}, 2000);
