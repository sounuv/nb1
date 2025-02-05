/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useState, useCallback, useEffect } from "react";
import n0 from "../assets/img/n01.svg";
import { IoIosSettings } from "react-icons/io";
import ball from "../assets/img/ballBlueLogin.png";
import Form from "./Form";
import TaskHistory from "./TaskHistory";
import TaskStatus from "./TaskStatus";
import { useAppState } from "../state/store";
import { Button, HStack, Input, useToast, VStack } from "@chakra-ui/react";
import RunTaskButton from "./RunTaskButton";
import { useTasks } from "../pages/tasks/hooks";

export default function PopBlueBall({
  handleView,
}: {
  handleView: (view: "main" | "settings" | "tasks") => void;
}) {
  // const [showTaskNameInput, setShowTaskNameInput] = useState(() => {
  //   return localStorage.getItem("showTaskNameInput") === "true";
  // });
  // const { saveTask } = useTasks();
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

  // function closePopBlueBall() {
  //   setCountExpand(0);
  //   setIsExpandForm(false);
  // }

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

  // const handleShowTaskNameInput = () => {
  //   setShowTaskNameInput(true);
  //   localStorage.setItem("showTaskNameInput", "true");
  // };

  // const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setTaskName(e.target.value);
  //   localStorage.setItem("taskName", e.target.value);
  // };

  // const handleConfirmTask = () => {
  //   const trimmedInstructions = state.instructions.trim();
  //   if (!taskName.trim() || !trimmedInstructions) {
  //     alert("Task name and command cannot be empty!");
  //     return;
  //   }

  //   saveTask({
  //     id: crypto.randomUUID(),
  //     name: taskName.trim(),
  //     command: trimmedInstructions,
  //   });

  //   setTaskName("");
  //   setShowTaskNameInput(false);
  //   localStorage.removeItem("taskName");
  //   localStorage.setItem("showTaskNameInput", "false");
  // };

  return (
    <div className="pop-blue-ball-container">
      <div
        className={`pop-blue-ball`}
        style={{
          height: "calc(100vh - 35px)",
        }}
      >
        <div className="expand-arrow-container">
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <IoIosSettings
              size={20}
              onClick={() => handleView("settings")}
              color="#828282"
            />
          </div>
        </div>

        <div className="content-container">
          <div className={`content-header`}>
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

            {/* <div
              className={`image-wrapper`}
            >
              <img src={n0} alt="Imagem n01" className="image-n01" />
            </div> */}
          </div>

          <div className="chat-scroll-bar">
            <TaskHistory
              setTaskName={setTaskName}
              taskName={taskName}
              state={state}
              runTask={runTask}
            />
            {/* <TaskStatus /> */}
          </div>

          {/* <VStack
            spacing={2}
            align="center"
            gap={10}
            display="flex"
            justifyContent="center"
          >
            <HStack>
              <RunTaskButton
                runTask={runTask}
                onShowTaskName={handleShowTaskNameInput}
              />
            </HStack>

            {showTaskNameInput && (
              <>
                <Input
                  placeholder="Task name..."
                  style={{
                    borderRadius: "4px",
                    padding: "10px 0px 10px 0px",
                    border: "none",
                    outline: "none",
                    width: "100%",
                    textIndent: "5px",
                    fontFamily: "Galano Grotesque Regular;",
                  }}
                  value={taskName}
                  onChange={handleTaskNameChange}
                  bg="white"
                />
                <Button
                  style={{
                    padding: "10px 5px 10px 5px",
                    backgroundColor: "green",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    width: "100%",
                    cursor: "pointer",
                  }}
                  onClick={handleConfirmTask}
                >
                  Confirm
                </Button>
              </>
            )}
          </VStack> */}
        </div>

        {/* <Form closePopBlueBall={closePopBlueBall} /> */}
        <Form />
      </div>
    </div>
  );
}
