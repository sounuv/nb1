import React, { useState } from "react";
import { useTasks, Task } from "./hooks";
import { Box, Button, HStack, Input, Icon } from "@chakra-ui/react";
import { BsPlayFill, BsTrash } from "react-icons/bs";

const TaskItem = ({ task, setView }: { task: Task; setView: (view: "main") => void }) => {
  const { executeTask, removeTask, updateTaskName } = useTasks();
  const [taskName, setTaskName] = useState(task.name);

  // 🔹 Atualizar nome da tarefa ao perder o foco no campo de input
  const handleBlur = () => {
    const trimmedName = taskName.trim();
    if (trimmedName && trimmedName !== task.name) {
      updateTaskName(task.id, trimmedName);
    }
  };

  // 🔹 Executar a tarefa e fechar automaticamente a tela de tarefas salvas
  const handleExecute = () => {
    executeTask(task);
    setView("main"); // 🔹 Fecha automaticamente a tela de tarefas salvas
  };

  return (
    <HStack spacing={3} p={3} bg="gray.100" borderRadius="md">
      <Input
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        onBlur={handleBlur} // 🔹 Salva a alteração quando o usuário sai do campo
        size="sm"
        bg="white"
      />
      <Button size="sm" colorScheme="green" onClick={handleExecute}>
        <Icon as={BsPlayFill} />
      </Button>
      <Button size="sm" colorScheme="red" onClick={() => removeTask(task.id)}>
        <Icon as={BsTrash} />
      </Button>
    </HStack>
  );
};

export default TaskItem;
