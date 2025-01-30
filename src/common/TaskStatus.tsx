
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
    idle: "💤 Ocioso",
    "attaching-debugger": "🔗 Anexando Depurador",
    "pulling-dom": "🌐 Entendendo o Site",
    "annotating-page": "🌐 Entendendo o Site",
    "fetching-knoweldge": "🧠 Obtendo Instruções",
    "generating-action": "🤔 Pensando e Planejando",
    "performing-action": "🚀 Executando Ação",
    waiting: "⏳ Aguardando",
  };

  return (
    <Box textColor="gray.500" textAlign="center" mt={4} mb={-4} fontSize="sm">
      {displayedStatus[actionStatus]}
    </Box>
  );
}
