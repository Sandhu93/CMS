import jwt from "jsonwebtoken";

export function socketMiddleware(socket) {
    if (!socket.handshake.auth || !socket.handshake.auth.token) {
        socket.disconnect();
        return;
    }
    const token = socket.handshake.auth.token;
    try {
        jwt.verify(token, process.env.JWT_SALT);
    } catch (error) {
        socket.disconnect();
        return;
    }
    console.log("Socket Connected");
}