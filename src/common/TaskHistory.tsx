/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
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
  Icon,
  Spacer,
  ColorProps,
  BackgroundProps,
  Input,
  Button,
} from "@chakra-ui/react";
import { TaskHistoryEntry } from "../state/currentTask";
import { BsSortNumericDown, BsSortNumericUp } from "react-icons/bs";
import { useAppState } from "../state/store";
import CopyButton from "./CopyButton";
import Notes from "./CustomKnowledgeBase/Notes";
import RunTaskButton from "./RunTaskButton";
import { useTasks } from "../pages/tasks/hooks";
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
  // const [taskCompleted, setTaskCompleted] = useState(false);

  // const [saveCommand, setSaveCommand] = useState(false);
  // const [closeCommandSave, setCloseCommandSave] = useState(false);
  const [showTaskNameInput, setShowTaskNameInput] = useState(() => {
    return localStorage.getItem("showTaskNameInput") === "true";
  });

  // const { saveTask } = useTasks();
  const { taskHistory, taskStatus } = useAppState((state) => ({
    taskStatus: state.currentTask.status,
    taskHistory: state.currentTask.history,
  }));
  const [sortNumericDown, setSortNumericDown] = useState(false);
  const toggleSort = () => {
    setSortNumericDown(!sortNumericDown);
  };

  // useEffect(() => {
  //   // Reseta o valor de "taskSaved" sempre que uma nova tarefa começa
  //   const taskSaved = localStorage.getItem("taskSaved");
  //   if (taskSaved === "true") {
  //     localStorage.setItem("taskSaved", "false");
  //   }

  //   setCloseCommandSave(false);
  // }, [taskStatus, state.instructions]);

  // useEffect(() => {
  //     if (state.taskState === "success") {
  //       setTaskCompleted(true);
  //     }
  //   }, [state.taskState]);

  //   useEffect(() => {
  //     setTaskCompleted(false);
  //   }, [state.instructions]);

  if (taskHistory.length === 0 && taskStatus !== "running") return null;
  const historyItems = taskHistory.map((entry, index) => (
    <TaskHistoryItem key={index} index={index} entry={entry} />
  ));
  // historyItems.unshift(<MatchedNotes key="matched-notes" />);
  if (!sortNumericDown) {
    historyItems.reverse();
  }

  const handleShowTaskNameInput = () => {
    setShowTaskNameInput(true);
    localStorage.setItem("showTaskNameInput", "true");
  };

  // const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setTaskName(e.target.value);
  //   localStorage.setItem("taskName", e.target.value);
  // };

  // const handleConfirmTask = () => {
  //   const trimmedInstructions = state.instructions.trim();
  //   if (!taskName.trim() || !trimmedInstructions) {
  //     alert("Task name and command cannot be empty!");
  //     return;
  //   }

  //   saveTask({
  //     id: crypto.randomUUID(),
  //     name: taskName.trim(),
  //     command: trimmedInstructions,
  //   });

  //   setTaskName("");
  //   setShowTaskNameInput(false);
  //   localStorage.removeItem("taskName");
  //   localStorage.setItem("showTaskNameInput", "false");
  //   localStorage.setItem("taskSaved", "true");
  // };

  return (
    // <VStack mt={8}>
    //   <HStack w="full">
    //     <Heading as="h3" size="md">
    //       Action History
    //     </Heading>
    //     <Spacer />
    //     <Icon
    //       as={sortNumericDown ? BsSortNumericDown : BsSortNumericUp}
    //       cursor="pointer"
    //       color="gray.500"
    //       _hover={{ color: "gray.700" }}
    //       onClick={toggleSort}
    //     />
    //     <CopyButton text={JSON.stringify(taskHistory, null, 2)} />
    //   </HStack>
    //   <Accordion allowMultiple w="full" pb="4">
    //     {historyItems}
    //   </Accordion>
    // </VStack>
    <VStack mt={8} paddingBottom={20} textColor="black">
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

        {/*  */}
      </Accordion>
    </VStack>
  );
}
