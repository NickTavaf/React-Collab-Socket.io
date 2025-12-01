import { io } from "socket.io-client";

// Replace this with your Render backend URL:
export const socket = io("https://react-collab-socket-io.onrender.com", {
  transports: ["websocket"],
});


