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
  Input,
} from "@chakra-ui/react";
import { TaskHistoryEntry } from "../state/currentTask";
import { useAppState } from "../state/store";
import CopyButton from "./recyclable/CopyButton";
import Notes from "./CustomKnowledgeBase/Notes";
import RunTaskButton from "./RunTaskButton";
import TaskStatus from "./TaskStatus";

function MatchedNotes() {
  const knowledge = useAppState((state) => state.currentTask.knowledgeInUse);
  const notes = knowledge?.notes;
  if (!notes || notes.length === 0) {
    return null;
  }

  return (
    <AccordionItem>
      <Heading as="h3" size="sm">
        <AccordionButton>
          <Box mr="4" fontWeight="bold">
            0.
          </Box>
          <Box as="span" textAlign="left" flex="1">
            Found {notes.length} instructions.
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </Heading>
      <AccordionPanel backgroundColor="gray.100" p="2">
        <Accordion allowMultiple w="full" defaultIndex={1}>
          <Box pl={2}>
            <Notes notes={notes} />
          </Box>
          <Alert status="info" borderRadius="sm" mt="1">
            <AlertIcon />
            <AlertDescription fontSize="0.8rem" lineHeight="4">
              You can customize the instructions in the settings menu.
            </AlertDescription>
          </Alert>
        </Accordion>
      </AccordionPanel>
    </AccordionItem>
  );
}

type TaskHistoryItemProps = {
  index: number;
  entry: TaskHistoryEntry;
};

const CollapsibleComponent = (props: {
  title: string;
  subtitle?: string;
  text: string;
}) => (
  <AccordionItem backgroundColor="white">
    <Heading as="h4" size="xs">
      <AccordionButton>
        <HStack flex="1">
          <Box>{props.title}</Box>
          <CopyButton text={props.text} /> <Spacer />
          {props.subtitle && (
            <Box as="span" fontSize="xs" color="gray.500" mr={4}>
              {props.subtitle}
            </Box>
          )}
        </HStack>
        <AccordionIcon />
      </AccordionButton>
    </Heading>
    <AccordionPanel>
      {props.text.split("\n").map((line, index) => (
        <Box key={index} fontSize="xs">
          {line}
          <br />
        </Box>
      ))}
    </AccordionPanel>
  </AccordionItem>
);

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
    // <AccordionItem>
    //   <Heading as="h3" size="sm" textColor={colors.text} bgColor={colors.bg}>
    //     <AccordionButton>
    //       <Box mr="4" fontWeight="bold">
    //         {index + 1}.
    //       </Box>
    //       <Box as="span" textAlign="left" flex="1">
    //         {itemTitle}
    //       </Box>
    //       <AccordionIcon />
    //     </AccordionButton>
    //   </Heading>
    //   <AccordionPanel backgroundColor="gray.100" p="2">
    //     <Accordion allowMultiple w="full" defaultIndex={1}>
    //       {entry.usage != null && (
    //         <>
    //           <CollapsibleComponent
    //             title="Prompt"
    //             subtitle={`${entry.usage.prompt_tokens} tokens`}
    //             text={entry.prompt}
    //           />
    //           <CollapsibleComponent
    //             title="Response"
    //             subtitle={`${entry.usage.completion_tokens} tokens`}
    //             text={entry.response}
    //           />
    //           <CollapsibleComponent
    //             title="Action"
    //             text={JSON.stringify(entry.action, null, 2)}
    //           />
    //         </>
    //       )}
    //     </Accordion>
    //   </AccordionPanel>
    // </AccordionItem>
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

  const { taskHistory, taskStatus, instructions } = useAppState((state) => ({
    taskStatus: state.currentTask.status,
    taskHistory: state.currentTask.history,
    instructions: state.ui.instructions ?? "",
  }));
  const [sortNumericDown, setSortNumericDown] = useState(false);
  const toggleSort = () => {
    setSortNumericDown(!sortNumericDown);
  };

  // if (taskHistory.length === 0 && taskStatus !== "running") {

  if (taskStatus === "idle" && taskHistory.length <= 0) {
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
        {/* <button
            style={{
              border: "none",
              background:
                "url(../../public/sphere.gif) center center / cover no-repeat",
              cursor: "pointer",
            }}
          ></button> */}
        <img
          src={sphere}
          alt="gif blue sphere"
          width="150px"
          style={{
            filter: "drop-shadow(0 0 8px rgba(0, 150, 255, 0.8))",
          }}
        />

        {/* <img style={{ height: "100px" }} src={ball} alt="Bolinha azul" /> */}
        <p style={{ fontWeight: "500" }}>Hello! What can i do for you?</p>
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
