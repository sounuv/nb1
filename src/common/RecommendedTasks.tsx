import { Button, VStack, Text } from "@chakra-ui/react";
import { useAppState } from "../state/store";

const tasks = [
  'Postar no twitter.com com o conteúdo "Um post automatizado de ibra-kdbra por @ibra-kdbra! :)" Se eu não estiver logado, falhe na tarefa e espere eu fazer login.',
  "Encontre um livro sobre IA e adicione uma cópia física ao carrinho na Amazon.com. Escolha a mais barata entre brochura e capa dura.",
];

const RecommendedTasks = ({
  runTask,
}: {
  runTask: (instructions: string) => void;
}) => {
  const state = useAppState((state) => ({
    instructions: state.ui.instructions,
  }));
  if (state.instructions) {
    return null;
  }

  const onButtonClick = (idx: number) => {
    runTask(tasks[idx]);
  };

  return (
    <VStack spacing={2} align="stretch">
      <Text fontSize="large" mt={1}>
        Exemplos:
      </Text>
      <Button
        textAlign="left"
        display="block"
        variant="outline"
        height="4rem"
        onClick={() => onButtonClick(0)}
      >
        <Text fontWeight={600} noOfLines={1}>
          Postar no twitter.com
        </Text>
        <Text fontWeight={400} noOfLines={1} color="gray">
          com o conteúdo &quot;Um post automatizado de ibra-kdbra por
          @ibra-kdbra!&quot;
        </Text>
      </Button>
      <Button
        textAlign="left"
        display="block"
        variant="outline"
        height="4rem"
        onClick={() => onButtonClick(1)}
      >
        <Text fontWeight={600} noOfLines={1}>
          Encontrar um livro sobre IA
        </Text>
        <Text fontWeight={400} noOfLines={1} color="gray">
          e adicionar uma cópia física ao carrinho na Amazon.com
        </Text>
      </Button>
    </VStack>
  );
};

export default RecommendedTasks;
