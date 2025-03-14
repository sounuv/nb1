import React from "react";
import { Box } from "@chakra-ui/react";
import { CurrentTaskSlice } from "../state/currentTask";
import { useAppState } from "../state/store";

export default function TaskStatus() {
  const { taskStatus, actionStatus } = useAppState((state) => ({
    taskStatus: state.currentTask.status,
    actionStatus: state.currentTask.actionStatus,
  }));

  if (taskStatus !== "running") {
    return null;
  }

  const displayedStatus: Record<CurrentTaskSlice["actionStatus"], string> = {
    idle: "💤 Idle",
    "attaching-debugger": "🔗 Attaching Debugger",
    "pulling-dom": "🌐 Understanding the Site",
    "annotating-page": "🌐 Understanding the Site",
    "fetching-knoweldge": "🧠 Fetching Instructions",
    "generating-action": "🤔 Thinking and Planning",
    "performing-action": "🚀 Executing Action",
    waiting: "⏳ Waiting",
  };

  return (
    <Box textColor="gray.500" textAlign="center" mt={2} mb={-4} fontSize="sm">
      <p style={{ color: "white" }}>{displayedStatus[actionStatus]}</p>
    </Box>
  );
}
