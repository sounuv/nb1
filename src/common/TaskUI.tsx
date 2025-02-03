import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Box,
  HStack,
  VStack,
  Spacer,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Input
} from "@chakra-ui/react";
import { debugMode } from "../constants";
import { useAppState } from "../state/store";
import RunTaskButton from "./RunTaskButton";
import VoiceButton from "./VoiceButton";
import TaskHistory from "./TaskHistory";
import TaskStatus from "./TaskStatus";
import RecommendedTasks from "./RecommendedTasks";
import AutosizeTextarea from "./AutosizeTextarea";
import { useTasks } from "../pages/tasks/hooks";

const TaskUI = () => {
  const { saveTask } = useTasks();
  const [taskName, setTaskName] = useState(() => {
    return localStorage.getItem("taskName") || ""; // 🔹 Recupera o nome salvo ao carregar
  });

  const [showTaskNameInput, setShowTaskNameInput] = useState(() => {
    return localStorage.getItem("showTaskNameInput") === "true"; // 🔹 Recupera estado salvo
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
    [toast]
  );

  const runTask = useCallback(() => {
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      runTask();
    }
  };

  // 🔹 Atualiza o `localStorage` ao mostrar o campo de nome
  const handleShowTaskNameInput = () => {
    setShowTaskNameInput(true);
    localStorage.setItem("showTaskNameInput", "true");
  };

  // 🔹 Atualiza o `localStorage` com o nome da tarefa
  const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskName(e.target.value);
    localStorage.setItem("taskName", e.target.value);
  };

  // 🔹 Função para salvar a tarefa com o nome definido pelo usuário
  const handleConfirmTask = () => {
    const trimmedInstructions = state.instructions.trim();
    if (!taskName.trim() || !trimmedInstructions) {
      alert("Task name and command cannot be empty!");
      return;
    }

    saveTask({
      id: crypto.randomUUID(),
      name: taskName.trim(),
      command: trimmedInstructions,
    });

    setTaskName("");
    setShowTaskNameInput(false);
    localStorage.removeItem("taskName"); // 🔹 Remove o nome salvo após confirmar
    localStorage.setItem("showTaskNameInput", "false");
  };

  return (
    <>
      <AutosizeTextarea
        autoFocus
        placeholder="Try telling Nova to do a task"
        value={state.instructions}
        isDisabled={taskInProgress || state.isListening}
        onChange={(e) => state.setInstructions(e.target.value)}
        mb={2}
        onKeyDown={onKeyDown}
      />
      <VStack spacing={2} align="stretch">
        <HStack>
          <RunTaskButton runTask={runTask} onShowTaskName={handleShowTaskNameInput} />
        </HStack>

        {showTaskNameInput && (
          <>
            <Input
              placeholder="Task name..."
              value={taskName}
              onChange={handleTaskNameChange}
              bg="white"
            />
            <Button colorScheme="blue" onClick={handleConfirmTask}>
              Confirm
            </Button>
          </>
        )}
      </VStack>

      {state.voiceMode && (
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <AlertDescription fontSize="sm" lineHeight="5">
            In Voice Mode, you can press the spacebar to start speaking and again to stop. Nova will execute the task when you stop speaking. To disable Voice Mode, click the Settings icon in the upper right corner.
          </AlertDescription>
        </Alert>
      )}
      {!state.voiceMode && !state.instructions && (
        <RecommendedTasks runTask={runTask} />
      )}
      {debugMode && <TaskHistory />}
      <TaskStatus />
    </>
  );
};

export default TaskUI;
