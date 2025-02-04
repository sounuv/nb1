/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { useAppState } from "../state/store";

import CustomKnowledgeBase from "./CustomKnowledgeBase";
import SetAPIKey from "./SetAPIKey";


type SettingsProps = {
  setView: (view: "main") => void;
};

const Settings = ({ setView }: SettingsProps) => {
  const [view, setLocalView] = useState<"settings" | "knowledge" | "api">(
    "settings",
  );
  const state = useAppState((state) => ({
    selectedModel: state.settings.selectedModel,
    updateSettings: state.settings.actions.update,
    voiceMode: state.settings.voiceMode,
    openAIKey: state.settings.openAIKey,
    anthropicKey: state.settings.anthropicKey,
  }));
  // const toast = useToast();

  if (!state.openAIKey && !state.anthropicKey) return null;

  // const isVisionModel = hasVisionSupport(state.selectedModel);

  const closeSetting = () => setView("main");
  // const openCKB = () => setLocalView("knowledge");
  const backToSettings = () => setLocalView("settings");

  return (
    <>
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}
      >
        <button
          style={{
            border: "1px solid #ccc",
            padding: "8px 10px",
            borderRadius: "4px",
            background: "transparent",
            cursor: "pointer",
          }}
          onClick={() =>
            view === "settings" ? closeSetting() : backToSettings()
          }
          aria-label="back"
        >
          <span style={{ color: "white" }}>&lt;</span> {/* Ícone de seta */}
        </button>
        <nav
          style={{ display: "flex", alignItems: "center", marginLeft: "16px" }}
        >
          <ul
            style={{
              display: "flex",
              listStyleType: "none",
              alignItems: "center",
              padding: "0",
              margin: "0",
            }}
          >
            <li style={{ marginRight: "4px" }}>
              <a
                href="#"
                onClick={backToSettings}
                style={{
                  color: "white",
                  fontSize: "1rem",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
                className="hoverLink"
              >
                Settings
              </a>
            </li>
            {view === "knowledge" && (
              <li style={{ marginRight: "8px" }}>
                <span> &gt; </span>
                <a
                  href="#"
                  style={{
                    color: "white",
                    fontSize: "1rem",
                  }}
                  className="hoverLink"
                >
                  Instruções
                </a>
              </li>
            )}
            {view === "api" && (
              <li>
                <span> &gt; </span>
                <a
                  href="#"
                  style={{
                    color: "white",
                    fontSize: "1rem",
                  }}
                  className="hoverLink"
                >
                  API
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>

      {view === "knowledge" && <CustomKnowledgeBase />}

      {view === "api" && (
        <div>
          <SetAPIKey
            asInitializerView={false}
            initialAnthropicKey={state.anthropicKey}
            initialOpenAIKey={state.openAIKey}
            onClose={backToSettings}
          />
        </div>
      )}

      {view === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div>
              <label htmlFor="api-settings" style={{ fontSize: "16px" }}>
                API Settings
              </label>
              <p style={{ fontSize: "14px", color: "gray" }}>
                The API key is stored locally on your device.
              </p>
            </div>
            <button
              onClick={() => setLocalView("api")}
              style={{
                padding: "8px 16px",
                backgroundColor: "transparent",
                border: "1px solid #ccc",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Edit
            </button>
          </div>
          <button
            onClick={() => setView("main")}
            style={{
              padding: "12px",
              backgroundColor: "gray",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>
      )}
    </>
  );
};

export default Settings;
