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
        Você precisará de uma chave de API do OpenAI ou Anthropic para executar o Nova no modo de desenvolvedor. Se você ainda não tiver uma, pode criar uma em sua{" "}
        <Link
          href="https://platform.openai.com/account/api-keys"
          color="blue"
          isExternal
        >
          conta OpenAI
        </Link>{" "}
        ou sua{" "}
        <Link
          href="https://console.anthropic.com/settings/keys"
          color="blue"
          isExternal
        >
          conta Anthropic
        </Link>
        .
        <br />
        <br />
        O Nova armazena suas chaves de API localmente no seu dispositivo e elas são usadas apenas para se comunicar com a API do OpenAI e/ou a API do Anthropic.
      </Text>
      <Box position="relative" py="2" w="full">
        <Divider />
        <AbsoluteCenter bg="white" px="4">
          OpenAI
        </AbsoluteCenter>
      </Box>
      <FormControl>
        <FormLabel>Chave de API do OpenAI</FormLabel>
        <HStack w="full">
          <Input
            placeholder="Insira a chave de API do OpenAI"
            value={openAIKey}
            onChange={(event) => setOpenAIKey(event.target.value)}
            type={showPassword ? "text" : "password"}
          />
          {asInitializerView && (
            <Button
              onClick={() => setShowPassword(!showPassword)}
              variant="outline"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </Button>
          )}
        </HStack>
      </FormControl>
      {!asInitializerView && (
        <FormControl>
          <FormLabel>URL Base (opcional)</FormLabel>
          <Input
            placeholder="Definir URL Base"
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
        <FormLabel>Chave de API do Anthropic</FormLabel>
        <HStack w="full">
          <Input
            placeholder="Insira a chave de API do Anthropic"
            value={anthropicKey}
            onChange={(event) => setAnthropicKey(event.target.value)}
            type={showPassword ? "text" : "password"}
          />
          {asInitializerView && (
            <Button
              onClick={() => setShowPassword(!showPassword)}
              variant="outline"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </Button>
          )}
        </HStack>
      </FormControl>
      {!asInitializerView && (
        <FormControl>
          <FormLabel>URL Base (opcional)</FormLabel>
          <Input
            placeholder="Definir URL Base"
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
        Salvar
      </Button>
    </VStack>
  );
};

export default SetAPIKey;
