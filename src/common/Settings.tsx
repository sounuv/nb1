import React, { useState } from "react";
import {
  Alert,
  AlertIcon,
  AlertDescription,
  IconButton,
  HStack,
  FormControl,
  FormLabel,
  FormHelperText,
  Switch,
  Button,
  VStack,
  Box,
  StackDivider,
  Flex,
  Spacer,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { ArrowBackIcon, EditIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useAppState } from "../state/store";
import ModelDropdown from "./ModelDropdown";
import { callRPC } from "../helpers/rpc/pageRPC";
import CustomKnowledgeBase from "./CustomKnowledgeBase";
import SetAPIKey from "./SetAPIKey";
import { hasVisionSupport } from "../helpers/aiSdkUtils";
import { debugMode } from "../constants";

type SettingsProps = {
  setInSettingsView: React.Dispatch<React.SetStateAction<boolean>>;
};

const Settings = ({ setInSettingsView }: SettingsProps) => {
  const [view, setView] = useState<"settings" | "knowledge" | "api">(
    "settings",
  );
  const state = useAppState((state) => ({
    selectedModel: state.settings.selectedModel,
    updateSettings: state.settings.actions.update,
    voiceMode: state.settings.voiceMode,
    openAIKey: state.settings.openAIKey,
    anthropicKey: state.settings.anthropicKey,
  }));
  const toast = useToast();

  if (!state.openAIKey && !state.anthropicKey) return null;

  const isVisionModel = hasVisionSupport(state.selectedModel);

  const closeSetting = () => setInSettingsView(false);
  const openCKB = () => setView("knowledge");
  const backToSettings = () => setView("settings");

  async function checkMicrophonePermission(): Promise<PermissionState> {
    if (!navigator.permissions) {
      return "prompt";
    }
    try {
      const permission = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      return permission.state;
    } catch (error) {
      console.error("Error checking microphone permission:", error);
      return "denied";
    }
  }

  const handleVoiceMode = async (isEnabled: boolean) => {
    if (isEnabled) {
      const permissionState = await checkMicrophonePermission();
      if (permissionState === "denied") {
        toast({
          title: "Erro",
          description:
            "O acesso ao microfone foi bloqueado anteriormente. Por favor, habilite-o nas configurações do seu navegador.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      } else if (permissionState === "prompt") {
        callRPC("injectMicrophonePermissionIframe", []).catch(console.error);
      } else if (permissionState === "granted") {
        console.log("Permissão de microfone concedida");
      }
    }
  };

  return (
    <>
      <HStack mb={4} alignItems="center">
        <IconButton
          variant="outline"
          icon={<ArrowBackIcon />}
          onClick={() =>
            view === "settings" ? closeSetting() : backToSettings()
          }
          aria-label="voltar"
        />
        <Breadcrumb separator={<ChevronRightIcon color="gray.500" />}>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={backToSettings}>
              Configurações
            </BreadcrumbLink>
          </BreadcrumbItem>
          {view === "knowledge" && (
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#">Instruções</BreadcrumbLink>
            </BreadcrumbItem>
          )}
          {view === "api" && (
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#">API</BreadcrumbLink>
            </BreadcrumbItem>
          )}
        </Breadcrumb>
      </HStack>
      {view === "knowledge" && <CustomKnowledgeBase />}
      {view === "api" && (
        <SetAPIKey
          asInitializerView={false}
          initialAnthropicKey={state.anthropicKey}
          initialOpenAIKey={state.openAIKey}
          onClose={backToSettings}
        />
      )}
      {view === "settings" && (
        <FormControl
          as={VStack}
          divider={<StackDivider borderColor="gray.200" />}
          spacing={4}
          align="stretch"
        >
          <Flex alignItems="center">
            <Box>
              <FormLabel mb="0">Configurações da API</FormLabel>
              <FormHelperText>
                A chave da API é armazenada localmente no seu dispositivo
              </FormHelperText>
            </Box>
            <Spacer />
            <Button onClick={() => setView("api")} rightIcon={<EditIcon />}>
              Editar
            </Button>
          </Flex>

          {debugMode && (
            <Button
              onClick={() => {
                state.updateSettings({
                  openAIKey: "",
                  anthropicKey: "",
                });
              }}
              colorScheme="red"
            >
              Limpar Chaves da API
            </Button>
          )}

          <Flex alignItems="center">
            <FormLabel mb="0">Selecionar Modelo</FormLabel>
            <Spacer />
            <Box w="50%">
              <ModelDropdown />
            </Box>
          </Flex>
          {!isVisionModel && (
            <Alert status="warning" borderRadius="lg">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                A maioria das capacidades da Nova são baseadas no modo GPT-4 Turbo. Outros modelos estão disponíveis para fins de pesquisa.
              </AlertDescription>
            </Alert>
          )}

          <Flex alignItems="center">
            <FormLabel mb="0">Ativar Modo de Voz</FormLabel>
            <Spacer />
            <Switch
              id="voiceModeSwitch"
              isChecked={state.voiceMode}
              onChange={(e) => {
                const isEnabled = e.target.checked;
                if (isEnabled && !state.openAIKey) {
                  toast({
                    title: "Erro",
                    description: "O Modo de Voz requer uma chave de API da OpenAI.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                  });
                  return;
                }
                handleVoiceMode(isEnabled);
                state.updateSettings({ voiceMode: isEnabled });
              }}
            />
          </Flex>
          <Flex alignItems="center">
            <FormLabel mb="0">Instruções Personalizadas</FormLabel>
            <Spacer />
            <Button rightIcon={<EditIcon />} onClick={openCKB}>
              Editar
            </Button>
          </Flex>
        </FormControl>
      )}
    </>
  );
};

export default Settings;
