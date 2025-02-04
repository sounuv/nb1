import { useState, useEffect, useCallback, useRef } from "react";

// Definição do tipo da tarefa
export interface Task {
  id: string;
  name: string;
  command: string;
}

// Hook para gerenciar tarefas salvas
export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const executedFromSavedTask = useRef(false);

  // Função para carregar as tarefas salvas do localStorage ao iniciar
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("savedTasks") || "[]");
    setTasks(savedTasks);
  }, []);

  // Atualizar localStorage sempre que as tarefas forem modificadas
  const updateLocalStorage = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem("savedTasks", JSON.stringify(newTasks));
  }, []);

  // 🔹 Função para salvar uma nova tarefa garantindo a integridade dos dados
  const saveTask = (task: Task | string) => {
    let newTask: Task;

    if (typeof task === "string") {
      const inputField = document.querySelector<HTMLInputElement>("#input-field");

      if (!inputField || !inputField.value.trim()) {
        alert("Nenhum comando encontrado para salvar!");
        return;
      }

      newTask = {
        id: crypto.randomUUID(),
        name: task || "Nova Tarefa",
        command: inputField.value.trim(),
      };
    } else {
      newTask = task;
    }

    // Evitar duplicatas antes de salvar
    const isDuplicate = tasks.some((t) => t.command === newTask.command);
    if (isDuplicate) {
      alert("Essa tarefa já foi salva anteriormente.");
      return;
    }

    updateLocalStorage([...tasks, newTask]);
  };

  // 🔹 Função para atualizar o nome de uma tarefa salva
  const updateTaskName = (taskId: string, newName: string) => {
    if (!newName.trim()) return; // Evita nomes vazios

    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, name: newName } : task
    );

    updateLocalStorage(updatedTasks);
  };

  // 🔹 Função para executar uma tarefa salva e redirecionar para a página correta
  const executeTask = (task: Task) => {
    executedFromSavedTask.current = true;

    // 🔹 Salva a tarefa no `localStorage` para que seja carregada na tela original
    localStorage.setItem("executingTask", JSON.stringify(task));

    // 🔹 Envia uma mensagem para o `background.ts` encontrar a aba ativa e focá-la
    chrome.runtime.sendMessage({ action: "FOCUS_TAB" });
  };

  // 🔹 Função para remover uma tarefa salva
  const removeTask = (id: string) => {
    updateLocalStorage(tasks.filter((t) => t.id !== id));
  };

  return { tasks, saveTask, executeTask, removeTask, updateTaskName };
};
