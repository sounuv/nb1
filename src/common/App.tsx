import {
  Heading,
  HStack,
  IconButton,
  // Icon,
  Image,
  Flex,
  Button,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
// import { BsFolder, BsX } from "react-icons/bs";
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

  function header() {
    return (
      <Flex alignItems="center">
        <Heading as="h1" size="lg">
          NB1
        </Heading>
        <Image
          src={n0ImgLogo}
          width="32"
          // className="translateImg"
          height="32"
          alt="n01 Logo"
        />
      </Flex>
    );
  }

  function iconsHeader() {
    return (
      <HStack>
        {view !== "settings" && (
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
        )}

        <Button
          // leftIcon={<Icon as={BsX} />}
          padding="12px"
          backgroundColor="gray"
          color="white"
          border="none"
          borderRadius="4px"
          cursor="pointer"
          // onClick={() => setView("tasks")}
          onClick={() => setView("main")}
        >
          {/* Saved Tasks */}X
        </Button>
      </HStack>
    );
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
              {header()}
              {hasAPIKey && <>{iconsHeader()}</>}
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
              {header()}
              {hasAPIKey && <>{iconsHeader()}</>}
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
            {header()}
            {hasAPIKey && <>{iconsHeader()}</>}
          </HStack>
          <SetAPIKey asInitializerView />
        </div>
      )}
    </>
  );
};

export default App;
