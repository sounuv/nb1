/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, HStack, Icon, Input } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAppState } from "../state/store";
import { BsStopFill } from "react-icons/bs";
import { useTasks } from "../pages/tasks/hooks";
// import { BsPlayFill, BsStopFill, BsSave } from "react-icons/bs";

export default function RunTaskButton(props: {
  runTask: () => void;
  onShowTaskName: () => void;
  taskName: string;
  setTaskName: (text: string) => void;
}) {
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [saveCommand, setSaveCommand] = useState(false);
  const { saveTask } = useTasks();
  const [closeCommandSave, setCloseCommandSave] = useState(false);

  const [showTaskNameInput, setShowTaskNameInput] = useState(() => {
    return localStorage.getItem("showTaskNameInput") === "true";
  });

  const state = useAppState((state) => ({
    taskState: state.currentTask.status,
    instructions: state.ui.instructions ?? "",
    interruptTask: state.currentTask.actions.interrupt,
  }));

  useEffect(() => {
    console.log("Estado da Tarefa:", state.taskState);
    console.log("Instruções:", state.instructions);
  }, [state.taskState]);

  useEffect(() => {
    if (state.taskState === "success") {
      setTaskCompleted(true);
    }
  }, [state.taskState]);

  useEffect(() => {
    setTaskCompleted(false);
  }, [state.instructions]);

  let button = null;
  // (
  //   <Button
  //     rightIcon={<Icon as={BsPlayFill} boxSize={6} />}
  //     onClick={props.runTask}
  //     colorScheme="green"
  //     disabled={state.taskState === "running" || !state.instructions}
  //   >
  //     Start Task
  //   </Button>
  // );

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
    const trimmedInstructions = state.instructions.trim();
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
    localStorage.removeItem("taskName");
    localStorage.setItem("showTaskNameInput", "false");
    localStorage.setItem("taskSaved", "true");
  };

  const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setTaskName(e.target.value);
    localStorage.setItem("taskName", e.target.value);
  };

  return (
    <HStack alignItems="center">
      {button}
      {taskCompleted &&
        // <Button
        //   onClick={props.onShowTaskName}
        //   style={{
        //     padding: "12px",
        //     backgroundColor: "gray",
        //     color: "white",
        //     border: "none",
        //     borderRadius: "4px",
        //     cursor: "pointer",
        //   }}
        // >
        //   Save Task
        // </Button>
        !closeCommandSave && (
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
                      backgroundColor: "green",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      width: "100%",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      props.onShowTaskName;

                      setSaveCommand(false);
                      handleConfirmTask();
                      setCloseCommandSave(true);
                    }}
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
                  <p className="message-text" style={{ fontWeight: "700" }}>
                    Do you want to save this command?
                  </p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      style={{
                        padding: "4px",
                        backgroundColor: "red",
                        border: "0",
                        width: "50%",
                        color: "white",
                        borderRadius: "0.3rem",
                      }}
                      onClick={() => {
                        setSaveCommand(false);
                        setCloseCommandSave(true);
                      }}
                    >
                      No
                    </button>
                    <button
                      style={{
                        padding: "4px",
                        backgroundColor: "green",
                        border: "0",
                        width: "50%",
                        color: "white",
                        borderRadius: "0.3rem",
                      }}
                      onClick={() => setSaveCommand(true)}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
    </HStack>
  );
}
