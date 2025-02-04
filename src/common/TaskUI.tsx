/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useAppState } from "../state/store";
import AutosizeTextarea from "./AutosizeTextarea";
import RecordVoice from "./RecordVoice";

// const injectContentScript = async () => {
//   const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
//   if (!tab || !tab.id) {
//     return;
//   }

//   await chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ["src/pages/contentInjected/index.js"],
//     world: "MAIN",
//   });
// };

const TaskUI = () => {
  // {
  //   closePopBlueBall,
  // }: {
  //   closePopBlueBall: () => void;
  // }
  // const { saveTask } = useTasks();

  const [taskName, setTaskName] = useState(() => {
    return localStorage.getItem("taskName") || ""; // 🔹 Recupera o nome salvo ao carregar
  });

  // const [showTaskNameInput, setShowTaskNameInput] = useState(() => {
  //   return localStorage.getItem("showTaskNameInput") === "true"; // 🔹 Recupera estado salvo
  // });

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

  // useEffect(() => {
  //   const listener = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  //     if (message.type === "NB1_OMNIBOX_INPUT") {
  //       console.log("Recebido input da omnibox:", message.payload);
  //       // Atualiza o input com o valor recebido
  //       state.setInstructions(message.payload);
  //       // Se quiser executar automaticamente:
  //       // setTimeout(() => { runTask(); }, 100);
  //       sendResponse({ status: "UI atualizada" });
  //     }
  //   };

  //   chrome.runtime.onMessage.addListener(listener);
  //   return () => {
  //     chrome.runtime.onMessage.removeListener(listener);
  //   };
  // }, [state.setInstructions, runTask]);

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
      area: string,
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runTask();
      // closePopBlueBall();
    }
  };

  // 🔹 Atualiza o `localStorage` ao mostrar o campo de nome
  // const handleShowTaskNameInput = () => {
  //   setShowTaskNameInput(true);
  //   localStorage.setItem("showTaskNameInput", "true");
  // };

  // 🔹 Atualiza o `localStorage` com o nome da tarefa
  // const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setTaskName(e.target.value);
  //   localStorage.setItem("taskName", e.target.value);
  // };

  // 🔹 Função para salvar a tarefa com o nome definido pelo usuário
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
  //   localStorage.removeItem("taskName"); // 🔹 Remove o nome salvo após confirmar
  //   localStorage.setItem("showTaskNameInput", "false");
  // };

  function changeValueInput(value: string) {
    state.setInstructions(value);
  }

  return (
    <div style={{ position: "relative" }}>
      <AutosizeTextarea
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        placeholder="Enter your command here."
        value={state.instructions}
        isDisabled={taskInProgress || state.isListening}
        onChange={(e) => state.setInstructions(e.target.value)}
        mb={2}
        onKeyDown={onKeyDown}
        style={{
          borderRadius: "1.25rem",
          padding: "10px 10px 0px",
          fontFamily: "Galano Grotesque Regular;",
          border: "none",
        }}
      />

      <RecordVoice changeValueInput={changeValueInput} />
      {/* <VStack spacing={2} align="stretch">
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
              value={taskName}
              onChange={handleTaskNameChange}
              bg="white"
            />
            <Button colorScheme="blue" onClick={handleConfirmTask}>
              Confirm
            </Button>
          </>
        )}
      </VStack> */}

      {/* {state.voiceMode && (
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <AlertDescription fontSize="sm" lineHeight="5">
            In Voice Mode, you can press the spacebar to start speaking and
            again to stop. Nova will execute the task when you stop speaking. To
            disable Voice Mode, click the Settings icon in the upper right
            corner.
          </AlertDescription>
        </Alert>
      )}
      {!state.voiceMode && !state.instructions && (
        <RecommendedTasks runTask={runTask} />
      )}
      <TaskHistory />
      <TaskStatus />
      <TaskHistory /> */}
    </div>
  );
};

export default TaskUI;
