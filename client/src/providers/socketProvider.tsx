import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const SocketContext = React.createContext<Socket | null>(null);

export function useSocket() {
    const socket = useContext(SocketContext);
    if (socket) {
        return socket;
    }
};

interface SocketProviderInput {
    token: string | null,
    children: React.ReactNode
}

export function SocketProvider({ token, children }: SocketProviderInput) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const newSocket = io('http://localhost:3000/', {
            auth: { token: token }
        });

        newSocket.on('error', (data) => {
            console.log('Error:', data.message);
            newSocket.disconnect();
            navigate("/login");
        });
        
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
        
    }, [token]);

    return (
        <SocketContext.Provider value={socket}>
            { children }
        </SocketContext.Provider>
    );
};
