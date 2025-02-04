import { createContext, useReducer, type ReactNode } from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

interface ChatContextType {
  messages: Message[];
  addMessage: (message: string) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);

export default function ChatContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [messages, dispatch] = useReducer(
    (
      state: Message[],
      action: {
        type: string;
        payload: {
          newMessage: Message;
        };
      }
    ) => {
      switch (action.type) {
        case "ADD_NEW_MESSAGE_USER": {
          return [...state, action.payload.newMessage];
        }
        case "ADD_NEW_MESSAGE_BOT": {
          return [...state, action.payload.newMessage];
        }
        default:
          return state;
      }
    },
    []
  );

  function addMessage(message: string) {
    dispatch({
      type: "ADD_NEW_MESSAGE_USER",
      payload: {
        newMessage: {
          id: Date.now(),
          text: message,
          sender: "user",
        },
      },
    });

    // const messageBot = setInterval(() => {
    //   dispatch({
    //     type: "ADD_NEW_MESSAGE_BOT",
    //     payload: {
    //       newMessage: {
    //         id: Date.now(),
    //         text: faker.lorem.sentences({ min: 1, max: 1 }),
    //         sender: "bot",
    //       },
    //     },
    //   });
    // }, 1000);

    // setTimeout(() => {
    //   clearInterval(messageBot);
    // }, 3000);
  }

  return (
    <ChatContext.Provider value={{ messages, addMessage }}>
      {children}
    </ChatContext.Provider>
  );
}
