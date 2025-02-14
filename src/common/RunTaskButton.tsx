/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, HStack, Input } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAppState } from "../state/store";
import { useTasks } from "../pages/tasks/hooks";

export default function RunTaskButton(props: {
  runTask: () => void;
  onShowTaskName: () => void;
  taskName: string;
  setTaskName: (text: string) => void;
}) {
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [saveCommand, setSaveCommand] = useState(false);
  const [isTaskSaved, setIsTaskSaved] = useState(false);
  const { saveTask } = useTasks();
  const [closeCommandSave, setCloseCommandSave] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showTaskNameInput, setShowTaskNameInput] = useState(() => {
    return localStorage.getItem("showTaskNameInput") === "true";
  });

  const state = useAppState((state) => ({
    taskState: state.currentTask.status,
    taskStatus: state.currentTask.status,
    instructions: state.ui.instructions ?? "",
    interruptTask: state.currentTask.actions.interrupt,
  }));

  useEffect(() => {
    // console.log("Estado da Tarefa:", state.taskState);
    // console.log("Instruções:", state.instructions);

    if (state.taskState === "success" || state.taskState === "interrupted") {
      setTaskCompleted(true);
    }
  }, [state.taskState]);

  useEffect(() => {
    if (state.taskState === "running") {
      setTaskCompleted(false);
    }
  }, [state.instructions, state.taskState]);



  let button = null;

  if (state.taskState === "running") {
 

    button = (
      <Button
        // rightIcon={<Icon as={BsStopFill} boxSize={6} />}
        onClick={state.interruptTask}
        style={{
          padding: "12px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "4px",
          marginInline: "auto",
          cursor: "pointer",
        }}
      >
        Stop
      </Button>
    );
  }

  const handleConfirmTask = () => {
    const lastCommand = localStorage.getItem("lastCommandTask");

    const trimmedInstructions = lastCommand?.trim();
    if (!props.taskName.trim() || !trimmedInstructions) {
      alert("Task name and command cannot be empty!");
      return;
    }

    saveTask({
      id: crypto.randomUUID(),
      name: props.taskName.trim(),
      command: trimmedInstructions,
    });

    props.setTaskName("");
    setShowTaskNameInput(false);
    setTaskCompleted(false);
    setSaveCommand(false);
    setCloseCommandSave(true);

    localStorage.removeItem("taskName");
    localStorage.setItem("showTaskNameInput", "false");
    localStorage.setItem("taskSaved", "true");
  };

  const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setTaskName(e.target.value);
    localStorage.setItem("taskName", e.target.value);
  };

  const buttonQuest = (
    onClick: () => void,
    backgroundColor: any,
    title: string,
  ) => (
    <button
      onClick={onClick}
      style={{
        padding: "4px",
        backgroundColor,
        border: "none",
        width: "50%",
        color: "white",
        borderRadius: "0.3rem",
      }}
    >
      {title}
    </button>
  );

  function questNotSaveTask() {
    setSaveCommand(false);
    setCloseCommandSave(true);
    setTaskCompleted(false);
  }

  function questSaveTask() {
    setSaveCommand(true);
  }

  function confirmSaveTask() {
    props.onShowTaskName;
    handleConfirmTask();
  }

  useEffect(() => {
    setIsTaskSaved(false);
    setCloseCommandSave(false);

    const savedTasks = JSON.parse(localStorage.getItem("savedTasks") || "[]");
    const lastCommand = localStorage.getItem("lastCommandTask");

    const isDuplicate = savedTasks.some((t: any) => t.command === lastCommand);

    if (isDuplicate) {
      setIsTaskSaved(true);
      return;
    }
  }, [state.taskStatus]);

  return (
    <HStack alignItems="center">
      {button}
      {taskCompleted && !closeCommandSave && !isTaskSaved && (
        <div
          className={`message user-message`}
          style={{ backgroundColor: "#7d7d7d" }}
        >
          {saveCommand ? (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  width: "100%",
                  paddingBlock: "10px",
                }}
              >
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
                  value={props.taskName}
                  onChange={handleTaskNameChange}
                  bg="white"
                />
                <Button
                  style={{
                    padding: "10px 5px 10px 5px",
                    backgroundColor: "#1134A6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    width: "100%",
                    cursor: "pointer",
                  }}
                  onClick={confirmSaveTask}
                >
                  Confirm
                </Button>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  paddingBottom: "5px",
                }}
              >
                <p className="message-text" style={{ fontWeight: "500" }}>
                  Do you want to save this command?
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  {[
                    {
                      backgroundColor: "#a7a7a7",
                      title: "No",
                      onClick: questNotSaveTask,
                    },
                    {
                      backgroundColor: "#1134A6",
                      title: "Yes",
                      onClick: questSaveTask,
                    },
                  ].map((item) =>
                    buttonQuest(item.onClick, item.backgroundColor, item.title),
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </HStack>
  );
}
