import { useState, useCallback, useEffect } from "react";
import { IoIosSettings } from "react-icons/io";
import TaskHistory from "./TaskHistory";
import { useAppState } from "../state/store";
import { useToast } from "@chakra-ui/react";
import TaskUI from "./TaskUI";
import n0 from "../assets/img/n01.svg";
import sphere from "../assets/media/sphere.gif";

export default function PopBlueBall({
  handleView,
}: {
  handleView: (view: "main" | "settings" | "tasks") => void;
}) {
  const [taskName, setTaskName] = useState(() => {
    return localStorage.getItem("taskName") || "";
  });
  const state = useAppState((state) => ({
    taskHistory: state.currentTask.history,
    taskStatus: state.currentTask.status,
    runTask: state.currentTask.actions.runTask,
    instructions: state.ui.instructions ?? "",
    setInstructions: state.ui.actions.setInstructions,
    voiceMode: state.settings.voiceMode,
    isListening: state.currentTask.isListening,
  }));

  const toast = useToast();

  const toastError = useCallback(
    (message: string) => {
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
    [toast],
  );

  const runTask = useCallback(() => {
    state.instructions.trim() && state.runTask(toastError);
  }, [state, toastError]);

  useEffect(() => {
    const storageListener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string,
    ) => {
      if (area === "local" && changes.omniboxInput) {
        const newValue = changes.omniboxInput.newValue;
        if (newValue) {
          console.log("Storage changed - omniboxInput:", newValue);
          state.setInstructions(newValue);
          runTask();
          chrome.storage.local.remove("omniboxInput");
        }
      }
    };

    chrome.storage.onChanged.addListener(storageListener);
    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, [state.setInstructions]);

  useEffect(() => {
    const savedTask = localStorage.getItem("executingTask");
    if (savedTask) {
      const task = JSON.parse(savedTask);
      state.setInstructions(task.command);
      setTaskName(task.name || "New Task");

      setTimeout(() => {
        state.runTask(toastError);
      }, 500);

      localStorage.removeItem("executingTask");
    }
  }, [state, toastError]);

  return (
    <div className="pop-blue-ball-container">
      <div
        className={`pop-blue-ball`}
        style={{
          height: "calc(100vh - 35px)",
        }}
      >
        {/* <div className="expand-arrow-container">
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <IoIosSettings
              size={20}
              onClick={() => handleView("settings")}
              color="#828282"
            />
          </div>
        </div> */}

        <div className="content-container">
          {state.taskHistory.length > 0 || state.taskStatus === "running" ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                // paddingBlock: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  transform: "translate(-20px, -4px)",
                  paddingTop: "6px",
                  paddingBottom: "10px",
                }}
                className="animation-pop"
              >
                {/* <img
                  src={ball}
                  alt="imagem blue ball"
                  height={50}
                  style={{ display: "block" }}
                /> */}
                <img
                  src={sphere}
                  alt="gif blue sphere"
                  width="50px"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(0, 150, 255, 0.8))",
                  }}
                />
                <img
                  src={n0}
                  alt="N01 text"
                  width={82}
                  height={21}
                  style={{ display: "block" }}
                />
              </div>

              <IoIosSettings
                size={20}
                style={{
                  display: "block",
                  marginBottom: "15px",
                }}
                onClick={() => handleView("settings")}
                color="#7E807F"
              />

              <hr
                className="hrHeader"
                style={{
                  width: "100vw",
                  boxSizing: "border-box",
                  height: "1px",
                  position: "absolute",
                  bottom: "-6px",
                  border: "none",
                  borderTop: "1px solid gray",
                  transform: "translateX(-28px)",
                  maxWidth: "420px",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBlock: "17px",
              }}
            >
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <img
                  src={n0}
                  alt="N01 text"
                  width={82}
                  height={21}
                  style={{ display: "block" }}
                />
              </div>

              <IoIosSettings
                size={20}
                style={{
                  display: "block",
                }}
                onClick={() => handleView("settings")}
                color="#7E807F"
              />
            </div>
          )}

          {/* <div className={`content-header`}>
            <div className="video-wrapper">
              <img
                style={{ width: "90px", height: "90px" }}
                src={ball}
                alt="Bolinha azul"
              />
            </div>

            <div className={`intro-text`}>
              <p
                className="intro-text-content"
                style={{
                  transform: "translateY(6px)",
                }}
              >
                Hello! What can I do for you?
              </p>
            </div>
          </div> */}

          <div className="chat-scroll-bar">
            <TaskHistory
              setTaskName={setTaskName}
              taskName={taskName}
              state={state}
              runTask={runTask}
            />
          </div>
        </div>

        <div className="form-container">
          <TaskUI />
        </div>
      </div>
    </div>
  );
}
