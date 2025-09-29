import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Layout } from "@/components/Layout";

interface CharacterHistory {
  id: string;
  name: string;
  avatar_url: string;
  author: string;
  lastChatDate: string;
  totalMessages: number;
  lastMessage: string;
  isVip?: boolean;
}

const mockCharacterHistory: CharacterHistory[] = [
  {
    id: "1",
    name: "Luna the Wise",
    avatar_url: "/placeholder.svg",
    author: "StoryMaster",
    lastChatDate: new Date().toISOString(),
    totalMessages: 24,
    lastMessage: "Hello there!",
    isVip: true,
  },
];

const Chats = () => {
  const navigate = useNavigate();
  const [characterHistory] = useState<CharacterHistory[]>(mockCharacterHistory);

  const startNewChat = (characterId: string) => {
    navigate(`/chat/${characterId}`);
  };

  return (
    <Layout headerPosition="fixed" contentUnderHeader>
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          {characterHistory.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Chats Available</h3>
              <p className="text-gray-400 mb-6">Chat history is currently not available.</p>
              <button
                onClick={() => navigate("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Go Home
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {characterHistory.map((character) => (
                <div
                  key={character.id}
                  className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => startNewChat(character.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                      {character.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{character.name}</h3>
                        {character.isVip && (
                          <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded">VIP</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">by {character.author}</p>
                      <p className="text-gray-300 text-sm">"{character.lastMessage}"</p>
                      <p className="text-gray-500 text-xs">{character.totalMessages} messages</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Chats;
