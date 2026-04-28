import { createContext, useContext, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { type GetToken, type UserResource } from "@clerk/shared/types";
import type { Conversation } from "#/types";
import { useQueryClient } from "@tanstack/react-query";

interface SocketProviderProps {
  children: React.ReactNode;
  user: UserResource | null;
  getToken: GetToken;
}

const SocketContext = createContext<Client | null>(null);

export const SocketProvider = ({
  children,
  user,
  getToken,
}: SocketProviderProps) => {
  const clientRef = useRef<Client | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      onConnect: () => {
        console.log("=== TERMINAL_UPLINK_ESTABLISHED ===");
        client.subscribe(
          `/topic/profiles/${user.id}/conversations`,
          (message) => {
            const conversation = JSON.parse(message.body) as Conversation;
            queryClient.setQueryData(
              ["conversations"],
              (oldData: Conversation[] | undefined) => {
                if (oldData?.some((c) => c.id === conversation.id)) {
                  return oldData;
                }
                return [conversation, ...(oldData || [])];
              },
            );
          },
        );
      },
    });

    client.beforeConnect = async () => {
      const token = await getToken({ template: "ww-template" });
      client.connectHeaders = { Authorization: `Bearer ${token}` };
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={clientRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
