import { HStack, Image, Flex } from "@chakra-ui/react";
import React, { useState } from "react";
import { useAppState } from "../state/store";
import SetAPIKey from "./SetAPIKey";
import Settings from "./Settings";
import TasksPage from "../pages/tasks";
import "./App.css";
import PopBlueBall from "./PopBlueBall";
import n01 from "@assets/img/n01.svg";
import sphere from "../assets/media/sphere.gif";
import { useAuth } from "./context/AuthContext";
import Login from "./Login";

const App = () => {
  const { isAuthenticated, toggleAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  // const [isAuthenticated2, setIsAuthenticated2] = React.useState(false);

  const hasAPIKey = useAppState(
    (state) => state.settings.anthropicKey || state.settings.openAIKey,
  );
  const [view, setView] = useState<"main" | "settings" | "tasks" | "setApi">(
    "main",
  );

  function handleView(view: "main" | "settings" | "tasks" | "setApi") {
    setView(view);
  }

  const LoadingScreen = () => {
    const [message, setMessage] = useState("Carregando");
    const messages = ["Carregando", "Buscando token", "Validando token"];

    React.useEffect(() => {
      const interval = setInterval(() => {
        setMessage((prevMessage) => {
          const currentIndex = messages.indexOf(prevMessage);
          const nextIndex = (currentIndex + 1) % messages.length;
          return messages[nextIndex];
        });
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="loading-container">
        <div className="loading-message">{message}...</div>
      </div>
    );
  };

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
            {/* <img
          src={sphere}
          alt="gif blue sphere"
          width="150px"
          style={{
            filter: "drop-shadow(0 0 8px rgba(0, 150, 255, 0.8))",
          }}
        /> */}
            <img
              src={sphere}
              alt="gif blue sphere"
              width="50px"
              style={{
                filter: "drop-shadow(0 0 8px rgba(0, 150, 255, 0.8))",
              }}
            />
            {/* <Image src={n0ImgLogo} width="32" height="49" alt="n01 Logo" /> */}
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

  React.useEffect(() => {
    setIsLoading(true);
    const checkAuthToken = async () => {
      // setIsLoading(true);

      // Função para validar o token na API /me
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const validateToken = async (token: string) => {
        try {
          const response = await fetch(
            "https://n8n-webhooks.bluenacional.com/webhook/nb1/api/auth/me",
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (!response.ok) throw new Error("Token inválido");

          const data = await response.json();
          setIsLoading(false);
          return data.status === true;
        } catch (error) {
          console.warn("Erro ao validar token:", error);
          return false;
        }
      };

      // 1️⃣ Buscar o authToken nos cookies do navegador (site)
      chrome.cookies.get(
        { url: "http://localhost:3000", name: "authToken" }, // in production, we should set the website url, localhost is only for development
        async (cookie) => {
          if (cookie && cookie.value) {
            console.log("AuthToken encontrado nos cookies do navegador.");
            // Copiar para os cookies da extensão
            chrome.cookies.set({
              url: "https://n8n-webhooks.bluenacional.com/",
              name: "authToken",
              value: cookie.value,
              secure: true,
              httpOnly: false, // Opcional, dependendo do seu backend
              expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 15, // Expira em 15 dias
            });

            // Validar o token
            const isValid = await validateToken(cookie.value);
            if (isValid) {
              toggleAuth(true);

              // setIsAuthenticated(true);
              // setIsLoading(false);
              return;
            }
          }

          console.warn(
            "Nenhum authToken válido encontrado no navegador, verificando na extensão...",
          );

          // 2️⃣ Buscar o authToken nos cookies da extensão
          chrome.cookies.get(
            {
              url: "https://n8n-webhooks.bluenacional.com/",
              name: "authToken",
            },
            async (extCookie) => {
              if (extCookie && extCookie.value) {
                console.log("AuthToken encontrado nos cookies da extensão.");

                // Validar o token
                const isValid = await validateToken(extCookie.value);
                if (isValid) {
                  toggleAuth(true);

                  // setIsAuthenticated(true);
                  // setIsLoading(false);
                  return;
                }
              }

              console.warn(
                "Nenhum authToken válido encontrado. Redirecionando para login.",
              );
              toggleAuth(false);
              setIsLoading(false);
              // setIsAuthenticated(false);
              // setIsLoading(false);
            },
          );
        },
      );
    };

    checkAuthToken();
  }, [toggleAuth, isAuthenticated, view]);

  if (!isAuthenticated && isLoading) {
    return <LoadingScreen />;
  }

  // if (!isAuthenticated) {
  //   return (
  //     <div
  //       style={{
  //         padding: "0px 20px",
  //       }}
  //     >
  //       <Login setIsAuthenticated={toggleAuth} />
  //     </div>
  //   );
  // }

  return (
    <>
      {isAuthenticated ? (
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
            <>
              {view !== "setApi" && (
                <div>
                  <Flex
                    alignItems="center"
                    position="relative"
                    paddingBottom={10}
                    paddingLeft={10}
                  >
                    {/* <Heading as="h1" size="lg">
        NB1
      </Heading> */}

                    <img
                      src={sphere}
                      alt="gif blue sphere"
                      width="50px"
                      style={{
                        filter: "drop-shadow(0 0 8px rgba(0, 150, 255, 0.8))",
                      }}
                    />
                    {/* <Image src={n0ImgLogo} width="32" height="49" alt="n01 Logo" /> */}
                    <Image src={n01} width="82" height="21" alt="n01 text" />
                  </Flex>
                </div>
              )}

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
                  {/* {header()} */}
                  {/* {hasAPIKey && <>{iconsHeader()}</>} */}
                </HStack>

                {/* {view === "settings" ? (
            <Settings setView={setView} />
          ) : view === "tasks" ? (
            <TasksPage setView={setView} />
          ) : (
            <SetAPIKey asInitializerView />
          )} */}

                <SetAPIKey asInitializerView handleView={handleView} />
              </div>
            </>
          )}
        </>
      ) : (
        <div
          style={{
            padding: "0px 20px",
          }}
        >
          <Login setIsAuthenticated={toggleAuth} />
        </div>
      )}
    </>
  );
};

export default App;
