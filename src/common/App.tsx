import {
  Link,
  Box,
  ChakraProvider,
  Heading,
  HStack,
  IconButton,
  Icon,
  Image,
  Flex,
  Button,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import { FaGithub } from "react-icons/fa6";
import { BsFolder } from "react-icons/bs";
import { useState } from "react";
import { useAppState } from "../state/store";
import SetAPIKey from "./SetAPIKey";
import TaskUI from "./TaskUI";
import Settings from "./Settings";
import TasksPage from "../pages/tasks";

const App = () => {
  const hasAPIKey = useAppState(
    (state) => state.settings.anthropicKey || state.settings.openAIKey,
  );
  const [view, setView] = useState<'main' | 'settings' | 'tasks'>('main');

  return (
    <ChakraProvider>
      <Box p="8" pb="24" fontSize="lg" w="full">
        <HStack mb={4} justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <Heading as="h1" size="lg">
              NB1
            </Heading>
            <Image src="/nova.png" width="8" height="8" alt="nova logo" />
          </Flex>
          {hasAPIKey && (
            <HStack>
              <IconButton
                icon={<SettingsIcon />}
                onClick={() => setView('settings')}
                aria-label="open settings"
              />
              <Button
                leftIcon={<Icon as={BsFolder} />}
                colorScheme="blue"
                onClick={() => setView('tasks')}
              >
                Saved Tasks
              </Button>
            </HStack>
          )}
        </HStack>
        {hasAPIKey ? (
          view === 'settings' ? (
            <Settings setView={setView} />
          ) : view === 'tasks' ? (
            <TasksPage setView={setView} />
          ) : (
            <TaskUI />
          )
        ) : (
          <SetAPIKey asInitializerView />
        )}
      </Box>
      <Box
        px="8"
        pos="fixed"
        w="100%"
        bottom={0}
        zIndex={2}
        as="footer"
        backdropFilter="auto"
        backdropBlur="6px"
        backgroundColor="rgba(255, 255, 255, 0.6)"
      >
        <HStack
          columnGap="1.5rem"
          rowGap="0.5rem"
          fontSize="md"
          borderTop="1px dashed gray"
          py="3"
          justify="center"
          shouldWrapChildren
          wrap="wrap"
        >
          <Link
            href="https://www.saudeblue.com/"
            isExternal
          >
            Number One by Inventu © 2025
          </Link>
        </HStack>
      </Box>
    </ChakraProvider>
  );
};

export default App;
