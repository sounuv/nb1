import React from "react";

interface LoginProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const inputs = [
    { label: "email", value: email, onChange: setEmail, type: "email" },
    {
      label: "password",
      value: password,
      onChange: setPassword,
      type: "password",
    },
  ];

  const handleLogin = async () => {
    try {
      const response = await fetch(
        "https://n8n-blue.up.railway.app/webhook/nb1/api/auth/login",
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
      setError("Credenciais inválidas ou plano inativo");
    }
  };

  const containerInput = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    type: string,
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label
        htmlFor={label}
        style={{ fontSize: "1.25rem", textTransform: "capitalize" }}
      >
        {label}
      </label>
      <input
        id={label}
        type={type}
        placeholder={`Enter your ${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          fontSize: "1rem",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "400px",
        margin: "20px auto 0 auto",
      }}
    >
      <h2 style={{ fontSize: "2rem", textAlign: "center", marginBlock: "0" }}>
        Login
      </h2>

      {error && (
        <div style={{ color: "red", fontSize: "1rem", textAlign: "center" }}>
          {error}
        </div>
      )}

      {inputs.map((input) =>
        containerInput(input.label, input.value, input.onChange, input.type),
      )}

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
