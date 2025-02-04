import {
  Heading,
  HStack,
  IconButton,
  Icon,
  Image,
  Flex,
  Button,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import { BsFolder } from "react-icons/bs";
import { useState } from "react";
import { useAppState } from "../state/store";
import SetAPIKey from "./SetAPIKey";
import Settings from "./Settings";
import TasksPage from "../pages/tasks";
import "./App.css";
import PopBlueBall from "./PopBlueBall";
import ChatContextProvider from "./context/ChatContext";
import n0ImgLogo from "@assets/img/n0ImgLogo.png";

const App = () => {
  const hasAPIKey = useAppState(
    (state) => state.settings.anthropicKey || state.settings.openAIKey,
  );
  const [view, setView] = useState<"main" | "settings" | "tasks">("main");

  function handleView(view: "main" | "settings" | "tasks") {
    setView(view);
  }

  return (
    <>
      {hasAPIKey ? (
        view === "settings" ? (
          <div
            style={{
              padding: "0px 20px",
            }}
          >
            {" "}
            <HStack mb={4} justifyContent="space-between" alignItems="center">
              <Flex alignItems="center">
                <Heading as="h1" size="lg">
                  NB1
                </Heading>
                <Image
                  src={n0ImgLogo}
                  width="32"
                  className="translateImg"
                  height="32"
                  alt="n01 Logo"
                />
              </Flex>
              {hasAPIKey && (
                <HStack>
                  <Button
                    leftIcon={<Icon as={BsFolder} />}
                    padding="12px"
                    backgroundColor="gray"
                    color="white"
                    border="none"
                    borderRadius="4px"
                    cursor="pointer"
                    onClick={() => setView("tasks")}
                  >
                    Saved Tasks
                  </Button>
                </HStack>
              )}
            </HStack>
            <Settings setView={setView} />
          </div>
        ) : view === "tasks" ? (
          <div
            style={{
              padding: "0px 20px",
            }}
          >
            <HStack mb={4} justifyContent="space-between" alignItems="center">
              <Flex alignItems="center">
                <Heading as="h1" size="lg">
                  NB1
                </Heading>
                <Image
                  src={n0ImgLogo}
                  width="32"
                  className="translateImg"
                  height="32"
                  alt="n01 Logo"
                />
              </Flex>
              {hasAPIKey && (
                <HStack>
                  <IconButton
                    icon={<SettingsIcon />}
                    padding="12px"
                    backgroundColor="gray"
                    color="white"
                    border="none"
                    borderRadius="4px"
                    cursor="pointer"
                    onClick={() => setView("settings")}
                    aria-label="open settings"
                  />

                  <Button
                    leftIcon={<Icon as={BsFolder} />}
                    padding="12px"
                    backgroundColor="gray"
                    color="white"
                    border="none"
                    borderRadius="4px"
                    cursor="pointer"
                    onClick={() => setView("tasks")}
                  >
                    Saved Tasks
                  </Button>
                </HStack>
              )}
            </HStack>
            <TasksPage setView={setView} />
          </div>
        ) : (
          <ChatContextProvider>
            <section className="section-box">
            

              <div className={`pop-up-form visible`}>
                <PopBlueBall handleView={handleView} />
              </div>
            </section>
          </ChatContextProvider>
        )
      ) : (
        <div
          style={{
            padding: "0px 20px",
          }}
        >
          <HStack mb={4} justifyContent="space-between" alignItems="center">
            <Flex alignItems="center">
              <Heading as="h1" size="lg">
                NB1
              </Heading>
              <Image
                src={n0ImgLogo}
                width="32"
                className="translateImg"
                height="32"
                alt="n01 Logo"
              />
            </Flex>
            {hasAPIKey && (
              <HStack>
                <IconButton
                  icon={<SettingsIcon />}
                  padding="12px"
                  backgroundColor="gray"
                  color="white"
                  border="none"
                  borderRadius="4px"
                  cursor="pointer"
                  onClick={() => setView("settings")}
                  aria-label="open settings"
                />
                <Button
                  leftIcon={<Icon as={BsFolder} />}
                  colorScheme="blue"
                  onClick={() => setView("tasks")}
                >
                  Saved Tasks
                </Button>
              </HStack>
            )}
          </HStack>
          <SetAPIKey asInitializerView />
        </div>
      )}
    </>
  );
};

export default App;
