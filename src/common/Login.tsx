import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
} from "@chakra-ui/react";
import React from "react";

type LoginProps = {
  onLogin: (token: string) => void;
};

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("https://n8n-webhooks.bluenacional.com/webhook/37653958-a7cf-4daf-9d54-9696feb72ae8", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error("Credenciais inválidas");
      }

      const data = await response.json();
      onLogin(data.access_token);
    } catch (err) {
      setError("Credenciais inválidas");
    }
  };

  return (
    <VStack spacing={4}>
      <Text fontSize="2xl">Login</Text>
      {error && <Text color="red.500">{error}</Text>}
      <FormControl>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Password</FormLabel>
        <Input
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
        />
      </FormControl>
      <Button onClick={handleLogin} w="full" colorScheme="blue">
        Login
      </Button>
    </VStack>
  );
};

export default Login;
