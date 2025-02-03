import React, { useState } from "react";
import { Task } from "./hooks";
import { HStack, Button, Input, Icon } from "@chakra-ui/react";
import { BsPlayFill, BsTrash } from "react-icons/bs";

interface TaskItemProps {
  task: Task;
  setView: (view: "main") => void;
  removeTask: (id: string) => void;
  updateTaskName: (taskId: string, newName: string) => void;
  executeTask: (task: Task) => void;
}

const TaskItem = ({
  task,
  setView,
  removeTask,
  updateTaskName,
  executeTask,
}: TaskItemProps) => {
  const [taskName, setTaskName] = useState(task.name);

  // Atualiza o nome ao sair do input
  const handleBlur = () => {
    const trimmedName = taskName.trim();
    if (trimmedName && trimmedName !== task.name) {
      updateTaskName(task.id, trimmedName);
    }
  };

  // Executa a task e volta para a tela principal
  const handleExecute = () => {
    executeTask(task);
    setView("main");
  };

  return (
    <HStack spacing={3} p={3} bg="gray.100" borderRadius="md">
      <Input
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        onBlur={handleBlur}
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
