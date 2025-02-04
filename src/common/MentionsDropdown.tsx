// MentionsDropdown.tsx
import React from "react";
import { Box, List, ListItem } from "@chakra-ui/react";
import { Task } from "../pages/tasks/hooks";

interface MentionsDropdownProps {
  tasks: Task[];
  selectedIndex: number;
  onSelect: (task: Task) => void;
}

const MentionsDropdown: React.FC<MentionsDropdownProps> = ({
  tasks,
  selectedIndex,
  onSelect,
}) => {
  if (tasks.length === 0) return null;

  return (
    <Box
      position="absolute"
      background="white"
      border="1px solid #ccc"
      borderRadius="md"
      mt={1}
      zIndex={1000}
      width="100%"
    >
      <List spacing={1} maxHeight="200px" overflowY="auto">
        {tasks.map((task, index) => (
          <ListItem
            key={task.id}
            padding="4px"
            background={index === selectedIndex ? "gray.200" : "white"}
            cursor="pointer"
            _hover={{ background: "gray.100" }}
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
