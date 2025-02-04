// TaskUI.tsx
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
  Input,
} from "@chakra-ui/react";
import { debugMode } from "../constants";
import { useAppState } from "../state/store";
import RunTaskButton from "./RunTaskButton";
import VoiceButton from "./VoiceButton";
import TaskHistory from "./TaskHistory";
import TaskStatus from "./TaskStatus";
import RecommendedTasks from "./RecommendedTasks";
import AutosizeTextarea from "./AutosizeTextarea";
import MentionsDropdown from "./MentionsDropdown"; // Importa o novo componente
import { useTasks, Task } from "../pages/tasks/hooks";

const TaskUI = () => {
  const { tasks, saveTask } = useTasks();
  const [taskName, setTaskName] = useState(() => localStorage.getItem("taskName") || "");
  const [showTaskNameInput, setShowTaskNameInput] = useState(() => localStorage.getItem("showTaskNameInput") === "true");

  // Estados para gerenciar o dropdown de @mentions
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

  // ... (outros useEffects permanecem iguais)

  // Atualiza o localStorage para o nome da tarefa
  const handleShowTaskNameInput = () => {
    setShowTaskNameInput(true);
    localStorage.setItem("showTaskNameInput", "true");
  };

  const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskName(e.target.value);
    localStorage.setItem("taskName", e.target.value);
  };

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
    localStorage.removeItem("taskName");
    localStorage.setItem("showTaskNameInput", "false");
  };

  // Função para tratar mudanças no textarea e detectar @mentions
  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    state.setInstructions(value);

    // Procura pelo último "@" seguido de caracteres até o final da string
    const mentionMatch = value.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
      setSelectedIndex(0); // reseta o índice selecionado
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  // Filtra as tarefas com base no mentionQuery
  const filteredTasks = tasks.filter((task) =>
    task.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Função chamada quando uma tarefa é selecionada (via mouse ou teclado)
  const handleSelectTask = (task: Task) => {
    // Atualiza o campo de instruções com o comando salvo da tarefa
    state.setInstructions(task.command);
    setShowMentions(false);
    setMentionQuery("");
    // Opcional: se desejar executar a tarefa automaticamente:
    runTask();
  };

  useEffect(() => {
    // Tenta recuperar o input salvo no chrome.storage.local (se existir)
    chrome.storage.local.get("omniboxInput", (result) => {
      if (result.omniboxInput) {
        console.log("Valor recuperado do storage:", result.omniboxInput);
        state.setInstructions(result.omniboxInput);
        runTask();
        // Limpa o valor para evitar reprocessamento
        chrome.storage.local.remove("omniboxInput");
      }
    });
  }, [state.setInstructions]);
  
// Listener para capturar mudanças no storage (caso o side panel já esteja aberto)
useEffect(() => {
  const storageListener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    area: string
  ) => {
    if (area === "local" && changes.omniboxInput) {
      const newValue = changes.omniboxInput.newValue;
      if (newValue) {
        console.log("Storage changed - omniboxInput:", newValue);
        state.setInstructions(newValue);
        runTask();
        // Opcional: remova o valor após atualizar, para evitar atualizações repetidas
        chrome.storage.local.remove("omniboxInput");
      }
    }
  };
  chrome.storage.onChanged.addListener(storageListener);
  return () => {
    chrome.storage.onChanged.removeListener(storageListener);
  };
}, [state.setInstructions]);

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
        // Se o dropdown estiver ativo e o usuário pressionar Enter (sem Shift), seleciona a tarefa
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
    <Box position="relative"> {/* Container relativo para posicionar o dropdown */}
      <AutosizeTextarea
        autoFocus
        placeholder="Try telling Nova to do a task"
        value={state.instructions}
        isDisabled={taskInProgress || state.isListening}
        onChange={handleInstructionsChange}
        mb={2}
        onKeyDown={onKeyDown}
      />
      {/* Exibe o dropdown de @mentions se necessário */}
      {showMentions && <MentionsDropdown tasks={filteredTasks} selectedIndex={selectedIndex} onSelect={handleSelectTask} />}

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
      <TaskHistory />
      <TaskStatus />
    </Box>
  );
};

export default TaskUI;
