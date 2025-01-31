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
        title: "Erro",
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
      setTaskName(task.name || "Nova Tarefa");

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
      alert("O nome da tarefa e o comando não podem estar vazios!");
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
        placeholder="Tente dizer ao Nova para fazer uma tarefa"
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
              placeholder="Nome da tarefa..."
              value={taskName}
              onChange={handleTaskNameChange}
              bg="white"
            />
            <Button colorScheme="blue" onClick={handleConfirmTask}>
              Confirmar
            </Button>
          </>
        )}
      </VStack>

      {state.voiceMode && (
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <AlertDescription fontSize="sm" lineHeight="5">
            No Modo de Voz, você pode pressionar a barra de espaço para começar a falar e novamente para parar. O Nova executará a tarefa quando você parar de falar. Para desativar o Modo de Voz, clique no ícone de Configurações no canto superior direito.
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
