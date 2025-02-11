/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */

import React, { useContext } from "react";
import { useAppState } from "../state/store";
import Login from "./Login";
import { useAuth } from "./context/AuthContext";

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
  handleView?: (view: "settings" | "main" | "tasks" | "setApi") => void;
};

const SetAPIKey = ({
  asInitializerView = false,
  initialOpenAIKey = "",
  initialAnthropicKey = "",
  onClose,
  handleView,
}: SetAPIKeyProps) => {
  const { isAuthenticated, toggleAuth } = useAuth();

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

  const [showPasswordAnthropic, setShowPasswordAnthropic] =
    React.useState<any>(false);
  const [showPasswordOpenAI, setShowPasswordOpenAi] =
    React.useState<any>(false);
  // const [isAuthenticated, setIsAuthenticated] = React.useState(false);
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
            // console.log("AuthToken encontrado nos cookies do navegador.");

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
                // console.log("AuthToken encontrado nos cookies da extensão.");

                // Validar o token
                const isValid = await validateToken(extCookie.value);
                if (isValid) {
                  toggleAuth(true);
                  setIsLoading(false);
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
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    if (handleView) {
      handleView("setApi");
    }
    return <Login setIsAuthenticated={toggleAuth} />;
  } else {
    if (handleView) {
      handleView("main");
    }
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

  const inputs = [
    {
      title: "OpenAI",
      providerKey: openAIKey,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setOpenAIKey(e.target.value),
      baseUrl: openAIBaseUrl,
      onChangeBaseUrl: (e: React.ChangeEvent<HTMLInputElement>) =>
        setOpenAIBaseUrl(e.target.value),
      onChangeVisibility: (e: React.ChangeEvent<HTMLInputElement>) =>
        setShowPasswordOpenAi(!showPasswordOpenAI),
      showPassword: showPasswordOpenAI,
    },
    {
      title: "Anthropic",
      providerKey: anthropicKey,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setAnthropicKey(e.target.value),
      baseUrl: anthropicBaseUrl,
      onChangeBaseUrl: (e: React.ChangeEvent<HTMLInputElement>) =>
        setAnthropicBaseUrl(e.target.value),
      onChangeVisibility: (e: React.ChangeEvent<HTMLInputElement>) =>
        setShowPasswordAnthropic(!showPasswordAnthropic),
      showPassword: showPasswordAnthropic,
    },
  ];

  const containerInputs = (
    title: string,
    providerKey: string,
    onChange: any,
    baseUrl: string,
    onChangeBaseUrl: any,
    onChangeVisibility: any,
    showPassword: boolean,
  ) => (
    <>
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
          {title}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label
          htmlFor={`${title.replace(/\s/g, "").toLowerCase()}Key`}
          style={{ fontSize: "1rem" }}
        >
          {title} API key
        </label>

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            id={`${title.replace(/\s/g, "").toLowerCase()}Key`}
            type={showPassword ? "text" : "password"}
            placeholder={`Insira a chave de API do ${title}`}
            value={providerKey}
            onChange={onChange}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              flex: 1,
            }}
          />
          {asInitializerView && (
            <button
              onClick={onChangeVisibility}
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

      {!asInitializerView && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            htmlFor={`${title.replace(/\s/g, "").toLowerCase()}BaseUrl`}
            style={{ fontSize: "1rem" }}
          >
            URL Base (opcional)
          </label>
          <input
            id={`${title.replace(/\s/g, "").toLowerCase()}BaseUrl`}
            type="text"
            placeholder="Define Base URL"
            value={baseUrl}
            onChange={onChangeBaseUrl}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>
      )}
    </>
  );

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
      <p style={{ margin: "0", height: "400" }}>
        You will need an OpenAI or Anthropic API key to run N01 in developer
        mode. If you don't already have one, you can create one in your{" "}
        <a
          href="https://platform.openai.com/account/api-keys"
          style={{ color: "blue", textDecoration: "none" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenAI account
        </a>{" "}
        ou sua{" "}
        <a
          href="https://console.anthropic.com/settings/keys"
          style={{ color: "blue", textDecoration: "none" }}
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

      {inputs.map((input) => (
        <React.Fragment key={input.title}>
          {containerInputs(
            input.title,
            input.providerKey,
            input.onChange,
            input.baseUrl,
            input.onChangeBaseUrl,
            input.onChangeVisibility,
            input.showPassword,
          )}
        </React.Fragment>
      ))}

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
          marginTop: "16px",
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
