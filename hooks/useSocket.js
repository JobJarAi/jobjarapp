// hooks/useSocket.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'localhost:3001';

const useSocket = () => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketInstance = io(SOCKET_URL, { autoConnect: true });

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            setSocket(socketInstance);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setSocket(null);
        });

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return socket;
};

export default useSocket;