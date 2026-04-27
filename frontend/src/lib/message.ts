import { type GetToken } from "@clerk/shared/types";

export const fetchMessageWithAudioBlob = async (
  getToken: GetToken,
  messageId: string,
) => {
  const token = await getToken({ template: "ww-template" });
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/messages/${messageId}/decode`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch decoded message: ${response.status}`);
  }

  const data = await response.json();

  const byteCharacters = atob(data.audioData);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "audio/wav" });

  return {
    decodedMessage: data.decodedMessage,
    blobUrl: URL.createObjectURL(blob),
  };
};
