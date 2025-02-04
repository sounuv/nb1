/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import iconMic from "../assets/img/iconMic.svg";
import iconMicRed from "../assets/img/iconMicRed.svg";

const view: any = window;

const SpeechRecognition =
  view.SpeechRecognition || view.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;

const userLanguage = navigator.language;
mic.lang = userLanguage;

// async function getUserPermission(): Promise<void> {
//   try {
//     // Usando getUserMedia para solicitar permissão para o microfone
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     console.log("Microphone access granted");

//     // Parando as tracks para que o microfone não fique ativo após a permissão
//     stream.getTracks().forEach((track) => track.stop());
//   } catch (error) {
//     console.error("Error requesting microphone permission", error);
//     throw new Error("MICROPHONE_PERMISSION_DENIED");
//   }
// }

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

  useEffect(() => {
    getLocalStream()
      .then(() => setMicPermissionGranted(true))
      .catch((error) => {
        console.error("Erro ao solicitar permissão", error);
        alert("Não foi possível acessar o microfone. Verifique as permissões.");
      });
  }, []);

  useEffect(() => {
    if (micPermissionGranted) {
      handleListen();
    }
  }, [isListening, micPermissionGranted]);

  const handleListen = () => {
    if (isListening) {
      mic.start();
      mic.onend = () => {
        console.log("continue..");
        mic.start();
      };
    } else {
      mic.stop();
      mic.onend = () => {
        console.log("Stopped Mic on Click");
      };
    }
    mic.onstart = () => {
      console.log("Mics on");
    };

    mic.onresult = (event: { results: Array<object> | any }) => {
      const transcript = Array.from(event.results)
        .map((result: Array<object> | any) => result[0].transcript)
        .join("");

      console.log(transcript);
      changeValueInput(transcript);

      mic.onerror = (event: { error: string }) => {
        console.log(event.error);
      };
    };
  };

  return (
    <button
      onClick={() => setIsListening((prevState) => !prevState)}
      type="button"
      className="mic-button"
    >
      <img
        src={isListening ? iconMicRed : iconMic}
        alt="Icone de um microfone"
        className="mic-icon"
      />
    </button>
  );
}
