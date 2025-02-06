/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */

import React from "react";
import { useAppState } from "../state/store";
import Login from "./Login";

// Componente simples de loading (pode personalizar como quiser)
const LoadingScreen = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Autenticando...</h2>
    </div>
  );
};

type SetAPIKeyProps = {
  asInitializerView?: boolean;
  initialOpenAIKey?: string;
  initialAnthropicKey?: string;
  onClose?: () => void;
};

const SetAPIKey = ({
  asInitializerView = false,
  initialOpenAIKey = "",
  initialAnthropicKey = "",
  onClose,
}: SetAPIKeyProps) => {
  const { updateSettings, initialOpenAIBaseUrl, initialAnthropicBaseUrl } =
    useAppState((state) => ({
      initialOpenAIBaseUrl: state.settings.openAIBaseUrl,
      initialAnthropicBaseUrl: state.settings.anthropicBaseUrl,
      updateSettings: state.settings.actions.update,
    }));

  // Estados para as chaves e URLs
  const [openAIKey, setOpenAIKey] = React.useState(initialOpenAIKey || "");
  const [anthropicKey, setAnthropicKey] = React.useState(
    initialAnthropicKey || "",
  );
  const [openAIBaseUrl, setOpenAIBaseUrl] = React.useState(
    initialOpenAIBaseUrl || "",
  );
  const [anthropicBaseUrl, setAnthropicBaseUrl] = React.useState(
    initialAnthropicBaseUrl || "",
  );

  const [showPassword, setShowPassword] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [authToken, setAuthToken] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(true);

  // React.useEffect(() => {
  //   fetch("https://n8n-webhooks.bluenacional.com/webhook/nb1/api/auth/me", {
  //     method: "POST",
  //     credentials: "include",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   })
  //     .then((response) => {
  //       if (!response.ok) throw new Error("Token inválido ou expirado");
  //       return response.json();
  //     })
  //     .then((data) => {
  //       if (data.status === true) {
  //         setIsAuthenticated(true);
  //       } else {
  //         setIsAuthenticated(false);
  //       }
  //     })
  //     .catch(() => {
  //       setIsAuthenticated(false);
  //     })
  //     .finally(() => {
  //       setIsLoading(false);
  //     });
  // }, []);

  React.useEffect(() => {
    const checkAuthToken = async () => {
      setIsLoading(true);

      // Função para validar o token na API /me
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
              setIsAuthenticated(true);
              setIsLoading(false);
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
                  setIsAuthenticated(true);
                  setIsLoading(false);
                  return;
                }
              }

              console.warn(
                "Nenhum authToken válido encontrado. Redirecionando para login.",
              );
              setIsAuthenticated(false);
              setIsLoading(false);
            },
          );
        },
      );
    };

    checkAuthToken();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Login setIsAuthenticated={setIsAuthenticated} />;
  }

  const onSave = () => {
    updateSettings({
      openAIKey,
      openAIBaseUrl,
      anthropicKey,
      anthropicBaseUrl,
    });
    onClose && onClose();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "0px 0px 10px 0px",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <p style={{ margin: "0" }}>
        You will need an OpenAI or Anthropic API key to run N01 in developer
        mode. If you don't already have one, you can create one in your{" "}
        <a
          href="https://platform.openai.com/account/api-keys"
          style={{ color: "blue" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenAI account
        </a>{" "}
        ou sua{" "}
        <a
          href="https://console.anthropic.com/settings/keys"
          style={{ color: "blue" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Anthropic account
        </a>
        .
        <br />
        <br />
        N01 stores its API keys locally on your device and are only used to
        communicate with the OpenAI API and/or the Anthropic API.
      </p>

      {/* Linha divisória - OpenAI */}
      <div style={{ position: "relative", padding: "8px 0" }}>
        <hr />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#202124",
            padding: "0 16px",
          }}
        >
          OpenAI
        </div>
      </div>

      {/* Input da OpenAI Key */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label
          htmlFor="openAIKey"
          style={{ fontSize: "1rem", fontWeight: 600 }}
        >
          OpenAI API key
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            id="openAIKey"
            type={showPassword ? "text" : "password"}
            placeholder="Enter the OpenAI API key"
            value={openAIKey}
            onChange={(e) => setOpenAIKey(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              flex: 1,
            }}
          />
          {asInitializerView && (
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                color: "white",
                backgroundColor: "transparent",
                cursor: "pointer",
              }}
            >
              {showPassword ? "Hidden" : "Show"}
            </button>
          )}
        </div>
      </div>

      {/* Input da OpenAI BaseUrl (opcional) */}
      {!asInitializerView && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="openAIBaseUrl" style={{ fontSize: "1rem" }}>
            URL Base (opcional)
          </label>
          <input
            id="openAIBaseUrl"
            type="text"
            placeholder="Define Base URL"
            value={openAIBaseUrl}
            onChange={(e) => setOpenAIBaseUrl(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>
      )}

      {/* Linha divisória - Anthropic */}
      <div style={{ position: "relative", padding: "8px 0" }}>
        <hr />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#202124",
            padding: "0 16px",
          }}
        >
          Anthropic
        </div>
      </div>

      {/* Input da Anthropic Key */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label
          htmlFor="anthropicKey"
          style={{ fontSize: "1rem", fontWeight: 600 }}
        >
          Anthropic API key
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            id="anthropicKey"
            type={showPassword ? "text" : "password"}
            placeholder="Enter the Anthropic API key"
            value={anthropicKey}
            onChange={(e) => setAnthropicKey(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              flex: 1,
            }}
          />
          {asInitializerView && (
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                color: "white",
                backgroundColor: "transparent",
                cursor: "pointer",
              }}
            >
              {showPassword ? "Hidden" : "Show"}
            </button>
          )}
        </div>
      </div>

      {/* Input da Anthropic BaseUrl (opcional) */}
      {!asInitializerView && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="anthropicBaseUrl" style={{ fontSize: "1rem" }}>
            URL Base (opcional)
          </label>
          <input
            id="anthropicBaseUrl"
            type="text"
            placeholder="Define Base URL"
            value={anthropicBaseUrl}
            onChange={(e) => setAnthropicBaseUrl(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>
      )}

      {/* Botão de salvar */}
      <button
        onClick={onSave}
        disabled={!openAIKey && !anthropicKey}
        style={{
          padding: "12px",
          backgroundColor: "#3182ce",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Save
      </button>
    </div>
  );
};

export default SetAPIKey;
