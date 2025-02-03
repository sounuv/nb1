import React from "react";
import TaskItem from "./TaskItem";
import { useTasks } from "./hooks";
import { Box, Button, Heading, VStack } from "@chakra-ui/react";

const TasksPage = ({ setView }: { setView: (view: "main") => void }) => {
  const { tasks } = useTasks();

  return (
    <Box p={5}>
      <Heading as="h1" size="lg" mb={4}>
        Saved Tasks
      </Heading>

      {tasks.length === 0 ? (
        <Box>No saved tasks.</Box>
      ) : (
        <VStack spacing={3} align="stretch">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} setView={setView} />
          ))}
        </VStack>
      )}

      <Button mt={4} colorScheme="gray" onClick={() => setView("main")}>
        Back
      </Button>
    </Box>
  );
};

export default TasksPage;
