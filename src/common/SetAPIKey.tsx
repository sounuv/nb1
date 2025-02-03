import {
  AbsoluteCenter,
  Box,
  Button,
  Divider,
  Input,
  VStack,
  Text,
  Link,
  HStack,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import React from "react";
import { useAppState } from "../state/store";
import Login from "./Login";

type SetAPIKeyProps = {
  asInitializerView?: boolean;
  initialOpenAIKey?: string;
  initialAnthropicKey?: string;
  onClose?: () => void;
};

const SetAPIKey = ({
  asInitializerView = false,
  initialOpenAIKey = "",
  initialAnthropicKey = "",
  onClose,
}: SetAPIKeyProps) => {
  const { updateSettings, initialOpenAIBaseUrl, initialAnthropicBaseUrl } =
    useAppState((state) => ({
      initialOpenAIBaseUrl: state.settings.openAIBaseUrl,
      initialAnthropicBaseUrl: state.settings.anthropicBaseUrl,
      updateSettings: state.settings.actions.update,
    }));

  const [openAIKey, setOpenAIKey] = React.useState(initialOpenAIKey || "");
  const [anthropicKey, setAnthropicKey] = React.useState(
    initialAnthropicKey || "",
  );
  const [openAIBaseUrl, setOpenAIBaseUrl] = React.useState(
    initialOpenAIBaseUrl || "",
  );
  const [anthropicBaseUrl, setAnthropicBaseUrl] = React.useState(
    initialAnthropicBaseUrl || "",
  );

  const [showPassword, setShowPassword] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [authToken, setAuthToken] = React.useState("");

  React.useEffect(() => {
    chrome.storage.local.get("authToken", (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving token from chrome.storage.local:", chrome.runtime.lastError);
        return;
      }
      const token = result.authToken;
      if (token) {
        setAuthToken(token);
        setIsAuthenticated(true);
      }
    });
  }, []);

  const handleLogin = (token: string) => {
    chrome.storage.local.set({ authToken: token }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving token to chrome.storage.local:", chrome.runtime.lastError);
        return;
      }
      setAuthToken(token);
      setIsAuthenticated(true);
    });
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const onSave = () => {
    // Use authToken if needed for API requests
    updateSettings({
      openAIKey,
      openAIBaseUrl,
      anthropicKey,
      anthropicBaseUrl,
    });
    onClose && onClose();
  };

  return (
    <VStack spacing={4}>
      <Text fontSize="sm">
        You will need an API key from OpenAI or Anthropic to run Nova in developer mode. If you don't have one yet, you can create one in your{" "}
        <Link
          href="https://platform.openai.com/account/api-keys"
          color="blue"
          isExternal
        >
          OpenAI account
        </Link>{" "}
        or your{" "}
        <Link
          href="https://console.anthropic.com/settings/keys"
          color="blue"
          isExternal
        >
          Anthropic account
        </Link>
        .
        <br />
        <br />
        Nova stores your API keys locally on your device and they are used only to communicate with the OpenAI API and/or the Anthropic API.
      </Text>
      <Box position="relative" py="2" w="full">
        <Divider />
        <AbsoluteCenter bg="white" px="4">
          OpenAI
        </AbsoluteCenter>
      </Box>
      <FormControl>
        <FormLabel>OpenAI API Key</FormLabel>
        <HStack w="full">
          <Input
            placeholder="Enter your OpenAI API key"
            value={openAIKey}
            onChange={(event) => setOpenAIKey(event.target.value)}
            type={showPassword ? "text" : "password"}
          />
          {asInitializerView && (
            <Button
              onClick={() => setShowPassword(!showPassword)}
              variant="outline"
            >
              {showPassword ? "Hide" : "Show"}
            </Button>
          )}
        </HStack>
      </FormControl>
      {!asInitializerView && (
        <FormControl>
          <FormLabel>Base URL (optional)</FormLabel>
          <Input
            placeholder="Set Base URL"
            value={openAIBaseUrl}
            onChange={(event) => setOpenAIBaseUrl(event.target.value)}
            type="text"
          />
        </FormControl>
      )}

      <Box position="relative" py={2} w="full">
        <Divider />
        <AbsoluteCenter bg="white" px="4">
          Anthropic
        </AbsoluteCenter>
      </Box>
      <FormControl>
        <FormLabel>Anthropic API Key</FormLabel>
        <HStack w="full">
          <Input
            placeholder="Enter your Anthropic API key"
            value={anthropicKey}
            onChange={(event) => setAnthropicKey(event.target.value)}
            type={showPassword ? "text" : "password"}
          />
          {asInitializerView && (
            <Button
              onClick={() => setShowPassword(!showPassword)}
              variant="outline"
            >
              {showPassword ? "Hide" : "Show"}
            </Button>
          )}
        </HStack>
      </FormControl>
      {!asInitializerView && (
        <FormControl>
          <FormLabel>Base URL (optional)</FormLabel>
          <Input
            placeholder="Set Base URL"
            value={anthropicBaseUrl}
            onChange={(event) => setAnthropicBaseUrl(event.target.value)}
            type="text"
          />
        </FormControl>
      )}
      <Button
        onClick={onSave}
        w="full"
        isDisabled={!openAIKey && !anthropicKey}
        colorScheme="blue"
      >
        Save
      </Button>
    </VStack>
  );
};

export default SetAPIKey;
