import { HStack, Image, Flex } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useAppState } from "../state/store";
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
  const [loadingToken, setLoadingToken] = useState(false);

  // Verifica se já existe uma API key (openAI ou Anthropic)
  const hasAPIKey = useAppState(
    (state) => state.settings.anthropicKey || state.settings.openAIKey,
  );
  // Função para atualizar as configurações (estado global)
  const updateSettings = useAppState((state) => state.settings.actions.update);

  // Possíveis views: "main", "settings", "tasks" ou "setApi"
  const [view, setView] = useState<"main" | "settings" | "tasks" | "setApi">(
    "main",
  );

  function handleView(view: "main" | "settings" | "tasks" | "setApi") {
    setView(view);
  }

  const LoadingScreen = () => {
    const [message, setMessage] = useState("Carregando");
    const messages = ["Carregando", "Buscando token", "Validando token"];

    useEffect(() => {
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
            <img
              src={sphere}
              alt="gif blue sphere"
              width="50px"
              style={{
                filter: "drop-shadow(0 0 8px rgba(0, 150, 255, 0.8))",
              }}
            />
            <Image src={n01} width="82" height="21" alt="n01 text" />
          </Flex>
        ) : (
          <Flex alignItems="center" paddingBlock="24px" position="relative">
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
        <Image src={n01} width="82" height="21" alt="n01 text" />
      </HStack>
    );
  }

  function containerHeader() {
    return (
      <div style={{ padding: "0px 20px" }}>
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
          <section className="section-box">
            <div className={`pop-up-form visible`}>
              <PopBlueBall handleView={handleView} />
            </div>
          </section>
        )}
      </div>
    );
  }

  // Verificação do authToken (mantivemos o fluxo existente)
  useEffect(() => {
    setIsLoading(true);
    const checkAuthToken = async () => {
      const validateToken = async (token: string) => {
        try {
          const response = await fetch(
            "https://n8n-webhooks.bluenacional.com/webhook/nb1/api/auth/me",
            {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
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

      chrome.cookies.get(
        { url: "http://localhost:3000", name: "authToken" },
        async (cookie) => {
          if (cookie && cookie.value) {
            console.log("AuthToken encontrado nos cookies do navegador.");
            chrome.cookies.set({
              url: "https://n8n-webhooks.bluenacional.com/",
              name: "authToken",
              value: cookie.value,
              secure: true,
              httpOnly: false,
              expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 15,
            });
            const isValid = await validateToken(cookie.value);
            if (isValid) {
              toggleAuth(true);
              return;
            }
          }
          console.warn(
            "Nenhum authToken válido encontrado no navegador, verificando na extensão...",
          );
          chrome.cookies.get(
            {
              url: "https://n8n-webhooks.bluenacional.com/",
              name: "authToken",
            },
            async (extCookie) => {
              if (extCookie && extCookie.value) {
                console.log("AuthToken encontrado nos cookies da extensão.");
                const isValid = await validateToken(extCookie.value);
                if (isValid) {
                  toggleAuth(true);
                  return;
                }
              }
              console.warn(
                "Nenhum authToken válido encontrado. Redirecionando para login.",
              );
              toggleAuth(false);
              setIsLoading(false);
            },
          );
        },
      );
    };
    checkAuthToken();
  }, [toggleAuth, isAuthenticated, view]);

  // Se o usuário estiver autenticado e não houver API key, busca o token automaticamente
  useEffect(() => {
    if (isAuthenticated && !hasAPIKey) {
      setLoadingToken(true);
      fetch("https://n8n-webhooks.bluenacional.com/webhook/nb1/api/token", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status) {
            // Atualiza o estado global com o token retornado (campo openAIKey)
            updateSettings({
              openAIKey: data.apiToken,
              openAIBaseUrl: "",
              anthropicKey: "",
              anthropicBaseUrl: "",
            });
            // Redireciona para a view "tasks"
            setView("main");
          } else {
            console.error("Erro ao obter API Token:", data.msg);
          }
        })
        .catch((error) => {
          console.error("Erro na requisição da API:", error);
        })
        .finally(() => setLoadingToken(false));
    }
  }, [isAuthenticated, hasAPIKey, updateSettings]);

  // Enquanto a autenticação estiver ocorrendo, exibe o loading
  if (!isAuthenticated && isLoading) {
    return <LoadingScreen />;
  }

  // Se o usuário estiver autenticado mas a API key ainda está sendo buscada, mostra loading
  if (isAuthenticated && !hasAPIKey && loadingToken) {
    return (
      <div style={{ padding: "0px 20px", textAlign: "center" }}>
        <h2>Obtendo API Token...</h2>
      </div>
    );
  }

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
            // Se não houver API key e não estivermos mais carregando, mostra mensagem de erro
            <div style={{ padding: "0px 20px", textAlign: "center" }}>
              <h2>Erro ao obter API Token. Tente novamente.</h2>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: "0px 20px" }}>
          <Login setIsAuthenticated={toggleAuth} />
        </div>
      )}
    </>
  );
};

export default App;
