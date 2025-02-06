import { HStack, Image, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { useAppState } from "../state/store";
import SetAPIKey from "./SetAPIKey";
import Settings from "./Settings";
import TasksPage from "../pages/tasks";
import "./App.css";
import PopBlueBall from "./PopBlueBall";
import n0ImgLogo from "@assets/img/n0ImgLogo.png";
import n01 from "@assets/img/n01.svg";

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
      <>
        {view === "main" ? (
          <Flex
            alignItems="center"
            transform={`translateX(-20px)`}
            borderBottom="1px solid gray"
            position="relative"
          >
            {/* <Heading as="h1" size="lg">
          NB1
        </Heading> */}

            <Image src={n0ImgLogo} width="32" height="49" alt="n01 Logo" />
            <Image src={n01} width="82" height="21" alt="n01 text" />
          </Flex>
        ) : (
          <Flex
            alignItems="center"
            paddingBlock="24px"
            // borderBottom="1px solid gray"
            position="relative"
          >
            {/* <Heading as="h1" size="lg">
          NB1
        </Heading> */}

            <button
              onClick={() => setView("main")}
              style={{
                backgroundColor: "transparent",
                fontWeight: "500",
                border: "none",
                color: "white",
                fontSize: "0.9rem",
              }}
            >
              &lt; &nbsp; Back
            </button>
          </Flex>
        )}
      </>
    );
  }

  function iconsHeader() {
    return (
      <HStack>
        {/* <IconButton
          icon={<SettingsIcon />}
          padding="4px 8px"
          backgroundColor="gray"
          color="white"
          border="none"
          borderRadius="4px"
          cursor="pointer"
          onClick={() => setView("settings")}
          aria-label="open settings"
        /> */}
        <Image src={n01} width="82" height="21" alt="n01 text" />

        {/* <Button
          padding="4px 8px"
          backgroundColor="gray"
          color="white"
          border="none"
          borderRadius="4px"
          cursor="pointer"
          onClick={() => setView("main")}
        >
          X
        </Button> */}
      </HStack>
    );
  }

  function containerHeader() {
    return (
      <div
        style={{
          padding: "0px 20px",
        }}
      >
        <HStack
          mb={4}
          justifyContent="space-between"
          alignItems="center"
          position="relative"
        >
          <hr
            className="hrHeader"
            style={{
              width: "100vw",
              boxSizing: "border-box",
              height: "1px",
              position: "absolute",
              bottom: "-11px",
              border: "none",
              borderTop: "1px solid gray",
              transform: "translateX(-28px)",
            }}
          />

          {header()}
          {hasAPIKey && <>{iconsHeader()}</>}
        </HStack>

        {view === "settings" ? (
          <Settings setView={setView} />
        ) : view === "tasks" ? (
          <TasksPage setView={setView} />
        ) : (
          <SetAPIKey asInitializerView />
        )}
      </div>
    );
  }

  return (
    <>
      {hasAPIKey ? (
        view === "settings" ? (
          <>{containerHeader()}</>
        ) : view === "tasks" ? (
          <>{containerHeader()}</>
        ) : (
          <section className="section-box">
            <div className={`pop-up-form visible`}>
              <PopBlueBall handleView={handleView} />
            </div>
          </section>
        )
      ) : (
        <>{containerHeader()}</>
      )}
    </>
  );
};

export default App;
