import React, { useCallback, useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useAppState } from "../state/store";
import AutosizeTextarea from "./AutosizeTextarea";
import RecordVoice from "./RecordVoice";
import MentionsDropdown from "./MentionsDropdown";
import { useTasks, Task } from "../pages/tasks/hooks";

const TaskUI = () => {
  const { updateMentionQuery, filteredTasks } = useTasks();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [taskName, setTaskName] = useState(
    () => localStorage.getItem("taskName") || "",
  );

  // const [mentionQuery, setMentionQuery] = useState<string>("");
  const [showMentions, setShowMentions] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const { updateLastCommand } = useTasks();

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
        // console.log("Valor recuperado do storage:", result.omniboxInput);
        state.setInstructions(result.omniboxInput);
        runTask();
        chrome.storage.local.remove("omniboxInput");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.setInstructions]);

  // useEffect(() => {
  //   if (state.taskStatus === "success") {
  //     state.setInstructions("");
  //   }
  // }, [state.taskStatus]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.setInstructions]);

  function changeValueInput(value: string) {
    state.setInstructions(value);
  }

  // Trata as mudanças no textarea e detecta @mentions
  const handleInstructionsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    state.setInstructions(value);
    const mentionMatch = value.match(/@(\w*)$/);
    if (mentionMatch) {
      updateMentionQuery(mentionMatch[1]);
      setShowMentions(true);
      setSelectedIndex(0);
    } else {
      setShowMentions(false);
      updateMentionQuery("");
    }
  };

  // Filtra as tasks com base no mentionQuery

  // Quando uma task é selecionada
  const handleSelectTask = (task: Task) => {
    state.setInstructions(task.command);
    setShowMentions(false);
    updateMentionQuery("");
    runTask();
  };

  // Tratamento das teclas no textarea
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredTasks.length - 1),
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredTasks.length > 0) {
          const selectedTask = filteredTasks[selectedIndex];
          handleSelectTask(selectedTask);
        }
      }
    } else {
      if (e.key === "Enter") {
        e.preventDefault();

        updateLastCommand(state.instructions.trim());
        runTask();
      }
    }
  };

  return (
    <div
      className="textarea-input"
      style={{
        position: "relative",
        borderRadius: "1.25rem",
        zIndex: "50",
      }}
    >
      <AutosizeTextarea
        placeholder="Enter your command here."
        value={state.instructions}
        isDisabled={taskInProgress || state.isListening}
        onChange={handleInstructionsChange}
        mb={2}
        onKeyDown={onKeyDown}
        style={{
          borderRadius: "1.25rem",
          padding: "7px 5px 10px 15px",
          fontFamily: "Galano Grotesque Regular;",
          border: "none",
          height: "54px",
          maxHeight: "72px",
        }}
      />
      {showMentions && (
        <MentionsDropdown
          placement="top" // ou "bottom", conforme sua necessidade
          selectedIndex={selectedIndex}
          onSelect={handleSelectTask}
        />
      )}

      {/* <RecordVoice changeValueInput={changeValueInput} /> */}
    </div>
  );
};

export default TaskUI;
