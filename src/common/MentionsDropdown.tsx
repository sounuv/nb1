import React from "react";
import { Box, List, ListItem } from "@chakra-ui/react";
import { Task } from "../pages/tasks/hooks";

interface MentionsDropdownProps {
  tasks: Task[];
  selectedIndex: number;
  onSelect: (task: Task) => void;
  placement?: "bottom" | "top"; // Opcional, padrão "bottom"
}

const MentionsDropdown: React.FC<MentionsDropdownProps> = ({
  tasks,
  selectedIndex,
  onSelect,
  placement = "bottom",
}) => {
  if (tasks.length === 0) return null;

  // Define o posicionamento: se "bottom", posiciona abaixo; se "top", posiciona acima do elemento pai.
  const placementStyle =
    placement === "bottom"
      ? { top: "calc(100% + 4px)" }
      : { bottom: "calc(100% + 4px)" };

  return (
    <Box
      position="absolute"
      width="100%"
      bg="white"
      border="1px solid"
      borderColor="gray.300"
      borderRadius="md"
      zIndex={1000}
      color="black" // Garante que o texto no container fique preto
      {...placementStyle}
    >
      <List sx={{ padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }} spacing={0}>
        {tasks.map((task, index) => (
          <ListItem
            key={task.id}
            paddingY={10}
            paddingLeft={6}
            w="98.2%"
            cursor="pointer"
            _hover={{ backgroundColor: "gray" }}
            backgroundColor={index === selectedIndex ? "gray" : "white"}
            // _focusVisible={{  backgroundColor: "red" }}
            // _active={{ backgroundColor: "green" }}
            // Usamos o sx para garantir que o hover tenha prioridade
            sx={{
            //   background: index === selectedIndex ? "gray.200" : "white",
              transition: "background 0.2s",
              hover: { background: "red" },
            }}
            onClick={() => onSelect(task)}
          >
            {task.name}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default MentionsDropdown;
