/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import iconMic from "../assets/img/iconMic.svg";
import iconMicRed from "../assets/img/iconMicRed.svg";
import { getUserPermission } from "../pages/permission/requestPermission"; // Import the function

const view: any = window;

const SpeechRecognition =
  view.SpeechRecognition || view.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;

const userLanguage = navigator.language;
mic.lang = userLanguage;

// Removed duplicate getUserPermission function

async function getLocalStream() {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      view.localStream = stream;
      view.localAudio.srcObject = stream;
      view.localAudio.autoplay = true;
    })
    .catch((err) => {
      console.error(`you got an error: ${err}`);
    });
}

export default function RecordVoice({
  changeValueInput,
}: {
  changeValueInput: (text: string) => void;
}) {
  const [isListening, setIsListening] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);

  const handleClick = async () => {
    if (!micPermissionGranted) {
      try {
        await getUserPermission(); // Request permission when the user clicks
        setMicPermissionGranted(true);
      } catch (error) {
        console.error("Permissão de microfone negada", error);
        alert("Não foi possível acessar o microfone. Verifique as permissões.");
        return;
      }
    }
    setIsListening((prev) => {
      if (!prev) {
        // If starting, also start recognition
        mic.start();
        mic.onend = () => {
          // Restart if necessary
          mic.start();
        };
      } else {
        mic.stop();
        mic.onend = () => {
          // Just to confirm the end
        };
      }
      return !prev;
    });
  };

  mic.onstart = () => {
    console.log("Microfone ativado");
  };

  mic.onresult = (event: { results: Array<any> }) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join("");
    changeValueInput(transcript);
  };

  mic.onerror = (event: { error: string }) => {
    console.error("Erro no reconhecimento de voz:", event.error);
  };

  return (
    <button onClick={handleClick} type="button" className="mic-button">
      <img
        src={isListening ? iconMicRed : iconMic}
        alt="Ícone do microfone"
        className="mic-icon"
      />
    </button>
  );
}