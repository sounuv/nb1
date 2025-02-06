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
  const [anthropicKey, setAnthropicKey] = React.useState(initialAnthropicKey || "");
  const [openAIBaseUrl, setOpenAIBaseUrl] = React.useState(initialOpenAIBaseUrl || "");
  const [anthropicBaseUrl, setAnthropicBaseUrl] = React.useState(initialAnthropicBaseUrl || "");

  // Estados para exibição de senha e controle de autenticação
  const [showPassword, setShowPassword] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [authToken, setAuthToken] = React.useState("");

  // Estado de loading para controlar a exibição da tela de carregamento
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Recupera o token do chrome.storage
    chrome.storage.local.get("authToken", (result) => {
      if (chrome.runtime.lastError) {
        console.error("Erro ao recuperar token:", chrome.runtime.lastError);
        setIsLoading(false);
        return;
      }

      const token = result.authToken;
      if (token) {
        // Verifica token via POST
        fetch("https://n8n-webhooks.bluenacional.com/webhook/nb1/api/auth/me", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: token }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Token inválido ou expirado");
            }
            return response.json();
          })
          .then((data) => {
            if (data.status === true) {
              setAuthToken(token);
              setIsAuthenticated(true);
            } else {
              console.error("Token não é válido:", data);
              chrome.storage.local.remove("authToken");
              setIsAuthenticated(false);
            }
          })
          .catch((err) => {
            console.error("Erro ao verificar token:", err);
            chrome.storage.local.remove("authToken");
            setIsAuthenticated(false);
          })
          .finally(() => {
            // Independentemente do resultado, paramos o loading
            setIsLoading(false);
          });
      } else {
        // Se não houver token, paramos o loading e deixamos isAuthenticated = false
        setIsLoading(false);
        setIsAuthenticated(false);
      }
    });
  }, []);

  const handleLogin = (token: string) => {
    // Salva o token no chrome.storage
    chrome.storage.local.set({ authToken: token }, () => {
      if (chrome.runtime.lastError) {
        console.error("Erro ao salvar token:", chrome.runtime.lastError);
        return;
      }
      setAuthToken(token);
      setIsAuthenticated(true);
    });
  };

  // 1) Enquanto estiver carregando, mostra tela de loading
  if (isLoading) {
    return <LoadingScreen />;
  }

  // 2) Se não estiver carregando mas o usuário não estiver autenticado, mostra tela de login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // 3) Usuário autenticado, exibe o restante do componente
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
        </a>.
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
        <label htmlFor="openAIKey" style={{ fontSize: "1rem", fontWeight: 600 }}>
          OpenAI API key
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            id="openAIKey"
            type={showPassword ? "text" : "password"}
            placeholder="Insira a chave de API do OpenAI"
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
        <label htmlFor="anthropicKey" style={{ fontSize: "1rem", fontWeight: 600 }}>
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
