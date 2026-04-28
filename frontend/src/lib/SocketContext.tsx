import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { type GetToken } from "@clerk/shared/types";
import type { Profile } from "#/types";

interface SocketProviderProps {
  children: React.ReactNode;
  user: Profile;
  getToken: GetToken;
}

const SocketContext = createContext<{
  client: Client | null;
  connected: boolean;
} | null>(null);

export const SocketProvider = ({
  children,
  user,
  getToken,
}: SocketProviderProps) => {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user?.id || clientRef.current) return;

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      onConnect: () => {
        setConnected(true);
      },
      onDisconnect: () => {
        setConnected(false);
      },
    });

    client.beforeConnect = async () => {
      const token = await getToken({ template: "ww-template" });
      client.connectHeaders = { Authorization: `Bearer ${token}` };
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        client.deactivate();
        clientRef.current = null;
      }
      setConnected(false);
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ client: clientRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
