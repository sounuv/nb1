/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { useAppState } from "../state/store";
import { RiSettings4Fill } from "react-icons/ri";

import CustomKnowledgeBase from "./CustomKnowledgeBase";
import SetAPIKey from "./SetAPIKey";
import TasksPage from "../pages/tasks";
import { useAuth } from "./context/AuthContext";

type SettingsProps = {
  setView: (view: "main" | "tasks") => void;
};

const Settings = ({ setView }: SettingsProps) => {
  const [view, setLocalView] = useState<
    "settings" | "knowledge" | "api" | "tasks"
  >("settings");
  const state = useAppState((state) => ({
    selectedModel: state.settings.selectedModel,
    updateSettings: state.settings.actions.update,
    voiceMode: state.settings.voiceMode,
    openAIKey: state.settings.openAIKey,
    anthropicKey: state.settings.anthropicKey,
  }));

  const {  toggleAuth } = useAuth();

  if (!state.openAIKey && !state.anthropicKey) return null;

  const backToSettings = () => setLocalView("settings");

  const options = [
    // {
    //   title: "Knowledge Base",
    //   onClick: () => setLocalView("knowledge"),
    //   description: "Manage your knowledge base",
    //   buttonTitle: "Edit",
    // },
    {
      title: "API Settings",
      onClick: () => setLocalView("api"),
      description: "The API key is stored locally on your device.",
      buttonTitle: "Edit",
    },
    {
      title: "Tasks",
      onClick: () => setLocalView("tasks"),
      description: "Your taks are saved locally on your device.",
      buttonTitle: "Tasks",
    },
  ];

  const containerOptions = (
    title: string,
    onClick: () => void,
    description: string,
    buttonTitle: string,
  ) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div>
        <label
          htmlFor={title.toLowerCase().replace(/\s/g, "")}
          style={{ fontSize: "16px" }}
        >
          {title}
        </label>
        <p style={{ fontSize: "14px", color: "gray" }}>{description}</p>
      </div>
      <button
        onClick={onClick}
        style={{
          padding: "8px 24px",
          backgroundColor: "#2B2D32",
          border: "none",
          borderRadius: "8px",
          width: "92px",
          color: "white",
          cursor: "pointer",
        }}
      >
        {buttonTitle}
      </button>
    </div>
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBlock: "25px",
        }}
      >
        <RiSettings4Fill color="white" size={20} />

        <nav
          style={{ display: "flex", alignItems: "center", marginLeft: "8px" }}
        >
          <ul
            style={{
              display: "flex",
              listStyleType: "none",
              alignItems: "center",
              color: "white",
              fontSize: "1.13rem",
              fontWeight: "500",
              padding: "0",
              margin: "0",
            }}
          >
            <li style={{ marginRight: "4px" }}>
              <a
                href="#"
                style={{
                  textDecoration: "none",
                }}
                onClick={backToSettings}
                // style={{
                //   color: "white",
                //   fontSize: "1.13rem",
                //   fontWeight: "500",
                //   margin: "0",
                // }}
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
                  // style={{
                  //   color: "white",
                  //   fontSize: "1.13rem",
                  //   fontWeight: "500",
                  // }}
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
                  // style={{
                  //   color: "white",
                  //   fontSize: "1.13rem",
                  //   fontWeight: "500",
                  // }}
                  className="hoverLink"
                >
                  API
                </a>
              </li>
            )}

            {view === "tasks" && (
              <li>
                <span> &gt; </span>
                <a
                  href="#"
                  // style={{
                  //   color: "white",
                  //   fontSize: "1.13rem",
                  //   fontWeight: "500",
                  // }}
                  className="hoverLink"
                >
                  Tasks
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>

      {/* {view !== "api" && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            margin: "20px 0px 0px 0px",
          }}
        >
          <RiSettings4Fill color="white" size={20} />
          <p
            style={{
              color: "white",
              fontSize: "1.1rem",
              fontWeight: "500",
              margin: "0",
            }}
          >
            Settings
          </p>
        </div>
      )} */}
      <div
       
      >
        <div>
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {options.map((option) =>
                containerOptions(
                  option.title,
                  option.onClick,
                  option.description,
                  option.buttonTitle,
                ),
              )}

<button
          onClick={() => {
            chrome.cookies.remove(
              {
                url: "https://n8n-blue.up.railway.app/",
                name: "authToken",
              },
              function () {
                toggleAuth(false);
                setView("main");
                // console.log("Cookie removido:", details);
              },
            );
          }}
          style={{
            padding: "8px 24px",
            backgroundColor: "#2B2D32",
            border: "none",
            borderRadius: "8px",
            width: "100%",
            color: "white",
            cursor: "pointer",
          }}
        >
          Sair
        </button>
            </div>
          )}

          {view === "tasks" && <TasksPage setView={setView} />}
        </div>

      
      </div>
    </>
  );
};

export default Settings;
