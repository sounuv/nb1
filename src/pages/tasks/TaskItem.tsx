import React, { useState } from "react";
import { useTasks, Task } from "./hooks";
import { Button, HStack, Input, Icon } from "@chakra-ui/react";
import { BsPlayFill, BsTrash, BsPencilSquare } from "react-icons/bs";

const TaskItem = ({
  task,
  setView,
  reloadPage,
}: {
  task: Task;
  setView: (view: "main") => void;
  reloadPage: (reload: boolean) => void;
}) => {
  const { executeTask, removeTask, updateTaskName } = useTasks();
  const [taskName, setTaskName] = useState(task.name);
  const [editMode, setEditMode] = useState(false);

  // 🔹 Atualizar nome da tarefa ao perder o foco no campo de input
  const handleBlur = () => {
    setEditMode(false);
    const trimmedName = taskName.trim();
    if (trimmedName && trimmedName !== task.name) {
      updateTaskName(task.id, trimmedName);
    }
  };

  // 🔹 Executar a tarefa e fechar automaticamente a tela de tarefas salvas
  const handleExecute = () => {
    executeTask(task);
    setView("main"); // 🔹 Fecha automaticamente a tela de tarefa    <HStack
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    }
  };

  return (
    <HStack
      spacing={3}
      p={3}
      bg="gray.100"
      borderRadius="md"
      marginBottom="16px"
    >
      <Input
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        onBlur={handleBlur} // 🔹 Salva a alteração quando o usuário sai do campo
        disabled={!editMode}
        onKeyDown={onKeyDown}
        size="sm"
        bg="white"
        style={{
          borderRadius: "8px",
          width: "100%",
          padding: "8px",
          border: "none",
          outline: "none",
          fontFamily: "Galano Grotesque Regular;",
        }}
      />
      <Button
        size="sm"
        backgroundColor="green"
        color="white"
        border="none"
        borderRadius="4px"
        height={30}
        width={50}
        cursor="pointer"
        onClick={handleExecute}
      >
        <Icon as={BsPlayFill} />
      </Button>
      <Button
        size="sm"
        backgroundColor="orange"
        color="white"
        border="none"
        height={30}
        width={50}
        borderRadius="4px"
        disabled={!editMode}
        cursor="pointer"
        onClick={() => setEditMode(true)}
      >
        <Icon as={BsPencilSquare} />
      </Button>
      <Button
        size="sm"
        backgroundColor="red"
        color="white"
        border="none"
        height={30}
        width={50}
        borderRadius="4px"
        cursor="pointer"
        onClick={() => {
          removeTask(task.id);
          reloadPage(true);
        }}
      >
        <Icon as={BsTrash} />
      </Button>
    </HStack>
  );
};

export default TaskItem;
