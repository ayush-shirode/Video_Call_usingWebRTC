import React from "react";
import { io } from "socket.io-client";

const SocketContext = React.createContext(null);

const socket = io("http://localhost:8001");

export const useSocket = () => {
    return React.useContext(SocketContext);
};

export const SocketProvider = ({children}) => {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}