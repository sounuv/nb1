import React from "react";

interface LoginProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch(
        "https://n8n-webhooks.bluenacional.com/webhook/nb1/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            email: email,
            password: password,
          }).toString(),
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Credenciais inválidas");
      }

      console.log("Login bem-sucedido, redirecionando...");

      setIsAuthenticated(true);
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Credenciais inválidas");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "400px",
        margin: "0 auto",
        // padding: "0px 20px",
      }}
    >
      <h2 style={{ fontSize: "2rem", textAlign: "center", marginBlock: "0" }}>
        Login
      </h2>

      {/* Exibição do erro, caso exista */}
      {error && (
        <div style={{ color: "red", fontSize: "1rem", textAlign: "center" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label htmlFor="email" style={{ fontSize: "1.25rem" }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            fontSize: "1rem",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label htmlFor="password" style={{ fontSize: "1.25rem" }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            fontSize: "1rem",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <button
        onClick={handleLogin}
        style={{
          padding: "12px",
          fontSize: "1rem",
          backgroundColor: "#3182ce",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Login
      </button>
    </div>
  );
};

export default Login;
