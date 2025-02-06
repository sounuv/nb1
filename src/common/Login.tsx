import React from "react";

type LoginProps = {
  onLogin: (token: string) => void;
};

const Login = ({ onLogin }: LoginProps) => {
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
        "https://n8n-webhooks.bluenacional.com/webhook/37653958-a7cf-4daf-9d54-9696feb72ae8",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: email,
            password: password,
          }).toString(),
        },
      );

      if (!response.ok) {
        throw new Error("Credenciais inválidas");
      }

      const data = await response.json();
      onLogin(data.access_token);
    } catch (err) {
      setError("Credenciais inválidas");
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
        margin: "0 auto",
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
