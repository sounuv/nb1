import { Button, HStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAppState } from "../state/store";
// import { BsPlayFill, BsStopFill, BsSave } from "react-icons/bs";

export default function RunTaskButton(props: {
  runTask: () => void;
  onShowTaskName: () => void;
}) {
  const [taskCompleted, setTaskCompleted] = useState(false);
  const state = useAppState((state) => ({
    taskState: state.currentTask.status,
    instructions: state.ui.instructions ?? "",
    interruptTask: state.currentTask.actions.interrupt,
  }));

  useEffect(() => {
    console.log("Estado da Tarefa:", state.taskState);
    console.log("Instruções:", state.instructions);
  }, [state.taskState]);

  useEffect(() => {
    if (state.taskState === "success") {
      setTaskCompleted(true);
    }
  }, [state.taskState]);

  useEffect(() => {
    setTaskCompleted(false);
  }, [state.instructions]);

  // let button = (
  //   <Button
  //     rightIcon={<Icon as={BsPlayFill} boxSize={6} />}
  //     onClick={props.runTask}
  //     colorScheme="green"
  //     disabled={state.taskState === "running" || !state.instructions}
  //   >
  //     Start Task
  //   </Button>
  // );

  // if (state.taskState === "running") {
  //   button = (
  //     <Button
  //       rightIcon={<Icon as={BsStopFill} boxSize={6} />}
  //       onClick={state.interruptTask}
  //       colorScheme="red"
  //     >
  //       Stop
  //     </Button>
  //   );
  // }

  return (
    <HStack alignItems="center">
      {/* {button} */}
      {taskCompleted && (
        <Button
          onClick={props.onShowTaskName}
          style={{
            padding: "12px",
            backgroundColor: "gray",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Save Task
        </Button>
      )}
    </HStack>
  );
}
