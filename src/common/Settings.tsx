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
  setView: (view: "main") => void;
};

const Settings = ({ setView }: SettingsProps) => {
  const [view, setLocalView] = useState<"settings" | "knowledge" | "api">(
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

  const closeSetting = () => setView("main");
  const openCKB = () => setLocalView("knowledge");
  const backToSettings = () => setLocalView("settings");

  return (
    <>
      <HStack mb={4} alignItems="center">
        <IconButton
          variant="outline"
          icon={<ArrowBackIcon />}
          onClick={() =>
            view === "settings" ? closeSetting() : backToSettings()
          }
          aria-label="Back"
        />
        <Breadcrumb separator={<ChevronRightIcon color="gray.500" />}>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={backToSettings}>
              Settings
            </BreadcrumbLink>
          </BreadcrumbItem>
          {view === "knowledge" && (
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#">Instructions</BreadcrumbLink>
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
              <FormLabel mb="0">API Settings</FormLabel>
              <FormHelperText>
                The API key is stored locally on your device
              </FormHelperText>
            </Box>
            <Spacer />
            <Button onClick={() => setLocalView("api")} rightIcon={<EditIcon />}>
              Edit
            </Button>
          </Flex>
          <Button mt={4} colorScheme="gray" onClick={() => setView("main")}>
            Back
          </Button>
        </FormControl>
      )}
    </>
  );
};

export default Settings;
