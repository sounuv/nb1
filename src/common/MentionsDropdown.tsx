import React from "react";
import { Box, List, ListItem } from "@chakra-ui/react";
import { Task, useTasks } from "../pages/tasks/hooks";

interface MentionsDropdownProps {
  selectedIndex: number;
  onSelect: (task: Task) => void;
  placement?: "bottom" | "top";
}

const MentionsDropdown: React.FC<MentionsDropdownProps> = ({
  selectedIndex,
  onSelect,
  placement = "bottom",
}) => {
  const { filteredTasks } = useTasks();

  if (filteredTasks.length === 0) return null;

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
      borderRadius="8px"
      transform={`translateX(8px)`}
      zIndex={1000}
      color="black"
      {...placementStyle}
    >
      <List
        sx={{
          paddingInline: "5px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
        spacing={0}
      >
        {filteredTasks.map((task, index) => (
          <ListItem
            key={task.id}
            paddingY={10}
            paddingLeft={6}
            borderRadius={4}
            w="98.2%"
            cursor="pointer"
            _hover={{ backgroundColor: "gray" }}
            backgroundColor={index === selectedIndex ? "gray" : "white"}
            sx={{
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
