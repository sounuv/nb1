import TaskItem from "./TaskItem";
import { useTasks } from "./hooks";
import { Box, VStack } from "@chakra-ui/react";

const TasksPage = ({ setView }: { setView: (view: "main") => void }) => {
  const { tasks } = useTasks();
  const backToSettings = () => setView("main");

  return (
    <Box>
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}
      >
        <button
          style={{
            border: "1px solid #ccc",
            padding: "8px 10px",
            borderRadius: "4px",
            background: "transparent",
            cursor: "pointer",
          }}
          onClick={() => backToSettings()}
          aria-label="back"
        >
          <span
            style={{
              color: "white",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            &lt;
          </span>
        </button>
        <p
          style={{
            color: "white",
            marginLeft: "16px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Tasks
        </p>
      </div>
      {/* 
      <Heading as="h1" size="lg" mb={4}>
        Saved Tasks
      </Heading> */}

      {tasks.length === 0 ? (
        <p style={{ fontSize: "16px" }}>No saved tasks.</p>
      ) : (
        <VStack  align="stretch">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} setView={setView} />
          ))}
        </VStack>
      )}

      <button
        onClick={() => setView("main")}
        style={{
          padding: "12px",
          backgroundColor: "gray",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Back
      </button>
    </Box>
  );
};

export default TasksPage;
