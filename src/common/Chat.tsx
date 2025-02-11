import { useState, useCallback, useEffect } from "react";
import { IoIosSettings } from "react-icons/io";
import TaskHistory from "./TaskHistory";
import { useAppState } from "../state/store";
import { useToast } from "@chakra-ui/react";
import TaskUI from "./TaskUI";
import n0 from "../assets/img/n01.svg";
import sphere from "../assets/media/sphere.gif";
import { useAuth } from "./context/AuthContext";

export default function Chat({
  handleView,
}: {
  handleView: (view: "main" | "settings" | "tasks") => void;
}) {
    const { toggleAnimation, hasShownAnimation } = useAuth();

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
          // console.log("Storage changed - omniboxInput:", newValue);
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

  useEffect(() => {
    if (!hasShownAnimation) {
      // Quando a animação é mostrada pela primeira vez
      if (state.taskStatus === "success" || state.taskStatus === "running") {
        setTimeout(() => {
          toggleAnimation(true);
          localStorage.setItem("hasShownAnimation", "true");
        }, 2500);
     
      }
    }
  }, [hasShownAnimation, state.taskStatus]);

  return (
    <div className="pop-blue-ball-container">
      <div
        className={`pop-blue-ball`}
        style={{
          height: "calc(100vh - 35px)",
        }}
      >
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
                  className={`${!hasShownAnimation ? "animation-sphere-show-header" : ""}`}
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(0, 150, 255, 0.8))",
                    // animationDelay: `${!hasShownAnimation ? "0.5s" : "0"}`
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
