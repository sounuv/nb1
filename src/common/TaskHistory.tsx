/* eslint-disable import/named */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import ball from "../assets/img/ballBlueLogin.png";
import sphere from "../assets/media/sphere.gif";
import {
  Alert,
  AlertIcon,
  AlertDescription,
  VStack,
  HStack,
  Box,
  Accordion,
  AccordionItem,
  Heading,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spacer,
  ColorProps,
  BackgroundProps,
} from "@chakra-ui/react";
import { TaskHistoryEntry } from "../state/currentTask";
import { useAppState } from "../state/store";
import CopyButton from "./recyclable/CopyButton";
import Notes from "./CustomKnowledgeBase/Notes";
import RunTaskButton from "./RunTaskButton";
import TaskStatus from "./TaskStatus";
import { useTasks } from "../pages/tasks/hooks";
import { useAuth } from "./context/AuthContext";

type TaskHistoryItemProps = {
  index: number;
  entry: TaskHistoryEntry;
};

const TaskHistoryItem = ({ index, entry }: TaskHistoryItemProps) => {
  const itemTitle = entry.action.thought;

  const colors: {
    text: ColorProps["textColor"];
    bg: BackgroundProps["bgColor"];
  } = {
    text: undefined,
    bg: undefined,
  };
  if (entry.action.operation.name === "fail") {
    colors.text = "red.800";
    colors.bg = "red.100";
  } else if (entry.action.operation.name === "finish") {
    colors.text = "green.800";
    colors.bg = "green.100";
  }

  return (
    <AccordionItem>
      <Heading as="h3" size="sm" textColor={colors.text}>
        <div>
          <div className={`message user-message`}>
            <p className="message-text">{itemTitle}</p>
          </div>
        </div>
      </Heading>
    </AccordionItem>
  );
};

export default function TaskHistory({
  state,
  taskName,
  setTaskName,
  runTask,
}: {
  state: any;
  taskName: string;
  setTaskName: (text: string) => void;
  runTask: any;
}) {
  const [showTaskNameInput, setShowTaskNameInput] = useState(() => {
    return localStorage.getItem("showTaskNameInput") === "true";
  });

    const { toggleAnimation, hasShownAnimation } = useAuth();

  // const [hasShownAnimation, setHasShownAnimation] = useState<boolean>(() => {
  //   return localStorage.getItem("hasShownAnimation") === "false";
  // });

  const { taskHistory, taskStatus, instructions } = useAppState((state) => ({
    taskStatus: state.currentTask.status,
    taskHistory: state.currentTask.history,
    instructions: state.ui.instructions ?? "",
  }));
  const [sortNumericDown, setSortNumericDown] = useState(false);
  const toggleSort = () => {
    setSortNumericDown(!sortNumericDown);
  };

  useEffect(() => {
    if (!hasShownAnimation) {
    
      // Quando a animação é mostrada pela primeira vez
      if (taskStatus === "running" || taskStatus === "success" ) {
        setTimeout(() => {
          toggleAnimation(true);
          localStorage.setItem("hasShownAnimation", "true");
        }, 2500);

    
      }
    }
  }, [hasShownAnimation, taskStatus]);

  

  if (
    taskStatus === "idle" ||
    (taskStatus === "running" && taskHistory.length <= 0)
  ) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          // gap: "20px",
          // paddingTop: "30px",
        }}
      >
        {!hasShownAnimation && (
          <img
            src={sphere}
            alt="gif blue sphere"
            className={`${taskStatus === "running" && "animation-sphere"}`}
            width="150px"
            style={{
              filter: "drop-shadow(0 0 8px rgba(0, 150, 255, 0.8))",
            }}
          />
        )}

        <>
          {taskStatus === "running" ? (
            <div>
              <div style={{ marginBottom: "10px" }}>
                <TaskStatus />
              </div>
            </div>
          ) : (
            <p style={{ fontWeight: "500" }}>Hello! What can I do for you?</p>
          )}
        </>
      </div>
    );
  }

  const historyItems = taskHistory.map((entry, index) => (
    <TaskHistoryItem key={index} index={index} entry={entry} />
  ));
  // historyItems.unshift(<MatchedNotes key="matched-notes" />);
  // if (!sortNumericDown) {
  //   historyItems.reverse();
  // }

  const handleShowTaskNameInput = () => {
    setShowTaskNameInput(true);
    localStorage.setItem("showTaskNameInput", "true");
  };

  return (
    <VStack paddingBottom={20} textColor="black">
      <Accordion allowMultiple w="full" pb="4" textColor="black">
        {historyItems}

        <div>
          <div style={{ marginBottom: "10px" }}>
            <TaskStatus />
          </div>

          {/* {taskStatus === "running" && taskHistory.length <= 0 && (
            <img
              src={sphere}
              alt="gif blue sphere"
              className={`animation-sphere`}
              width="150px"
              style={{
                filter: "drop-shadow(0 0 8px rgba(0, 150, 255, 0.8))",
              }}
            />
          )} */}

          {!showTaskNameInput && (
            <RunTaskButton
              runTask={runTask}
              onShowTaskName={handleShowTaskNameInput}
              taskName={taskName}
              setTaskName={setTaskName}
            />
          )}
        </div>
      </Accordion>
    </VStack>
  );
}
