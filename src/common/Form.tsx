/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { ChatContext } from "./context/ChatContext";
import { useToast } from "@chakra-ui/react";
import TaskUI from "./TaskUI";

export type Inputs = {
  text: string;
};

export default function Form({
  closePopBlueBall,
}: {
  closePopBlueBall: () => void;
}) {
  const context = useContext(ChatContext);
  const { register, handleSubmit, setValue, getValues } = useForm<Inputs>();
  const toast = useToast();

  if (!context) {
    return null;
  }

  const { addMessage } = context;

  const toastError = (message: string) => {
    toast({
      title: "Erro",
      description: message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  };

  const runTask = () => {
    const text = getValues("text");
    if (text && text.trim()) {
      addMessage(text);
      console.log("Tarefa executada com o texto:", text);
      setValue("text", "");
      closePopBlueBall();
    } else {
      toastError("Não é permitido o envio de um comando vazio.");
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit(runTask)}>
      {/* <TaskUI closePopBlueBall={closePopBlueBall} /> */}
      <TaskUI />

      <button type="submit" className="hidden">
        Enviar
      </button>
    </form>
  );
}
