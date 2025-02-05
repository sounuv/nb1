/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from "react";
import { useToast, Box } from "@chakra-ui/react";
import { useAppState } from "../state/store";
import AutosizeTextarea from "./AutosizeTextarea";
import RecordVoice from "./RecordVoice";
import MentionsDropdown from "./MentionsDropdown";
import { useTasks, Task } from "../pages/tasks/hooks";

const TaskUI = () => {
  const { tasks, saveTask } = useTasks();

  const [taskName, setTaskName] = useState(() => localStorage.getItem("taskName") || "");
  const [showTaskNameInput, setShowTaskNameInput] = useState(() => localStorage.getItem("showTaskNameInput") === "true");

  const [mentionQuery, setMentionQuery] = useState<string>("");
  const [showMentions, setShowMentions] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

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
  const taskInProgress = state.taskStatus === "running";

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
    localStorage.removeItem("taskSaved");
    state.instructions.trim() && state.runTask(toastError);
  }, [state, toastError]);

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
    chrome.storage.local.get("omniboxInput", (result) => {
      if (result.omniboxInput) {
        console.log("Valor recuperado do storage:", result.omniboxInput);
        state.setInstructions(result.omniboxInput);
        runTask();
        chrome.storage.local.remove("omniboxInput");
      }
    });
  }, [state.setInstructions]);

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

  function changeValueInput(value: string) {
    state.setInstructions(value);
  }

  // Trata as mudanças no textarea e detecta @mentions
  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    state.setInstructions(value);
    const mentionMatch = value.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
      setSelectedIndex(0);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  // Filtra as tasks com base no mentionQuery
  const filteredTasks = tasks.filter((task) =>
    task.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Quando uma task é selecionada
  const handleSelectTask = (task: Task) => {
    state.setInstructions(task.command);
    setShowMentions(false);
    setMentionQuery("");
    runTask();
  };

  // Tratamento das teclas no textarea
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredTasks.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (filteredTasks.length > 0) {
          const selectedTask = filteredTasks[selectedIndex];
          handleSelectTask(selectedTask);
        }
      }
    } else {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        runTask();
      }
    }
  };

  return (
    <div
      style={{
        position: "relative",
        paddingRight: "10px",
        backgroundColor: "white",
        borderRadius: "1.25rem",
      }}
    >
      {/* <Box position="relative"> */}
        <AutosizeTextarea
          autoFocus
          placeholder="Enter your command here."
          value={state.instructions}
          isDisabled={taskInProgress || state.isListening}
          onChange={handleInstructionsChange}
          mb={2}
          onKeyDown={onKeyDown}
          style={{
            borderRadius: "1.25rem",
            padding: "10px 10px 0px",
            fontFamily: "Galano Grotesque Regular;",
            border: "none",
          }}
        />
        {showMentions && (
          <MentionsDropdown
            placement="top" // ou "bottom", conforme sua necessidade
            tasks={filteredTasks}
            selectedIndex={selectedIndex}
            onSelect={handleSelectTask}
          />
        )}
      {/* </Box> */}

      <RecordVoice changeValueInput={changeValueInput} />
    </div>
  );
};

export default TaskUI;
