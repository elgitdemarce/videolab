// src/ProgressComponent.jsx
import React, { useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const ProgressComponent = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Seleccione archivos para procesar");
  const [ffmpeg] = useState(() => createFFmpeg({ log: true }));
  const [currentFiles, setCurrentFiles] = useState([]);
  
  const loadFFmpeg = async () => {
    setStatus("Cargando FFmpeg...");
    await ffmpeg.load();
    setStatus("FFmpeg cargado");
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setCurrentFiles(files);
    setStatus(`${files.length} archivo(s) listo(s) para procesar.`);
  };

  const processVideos = async () => {
    if (currentFiles.length === 0) {
      setStatus("Seleccione archivos primero.");
      return;
    }

    await loadFFmpeg();

    for (const file of currentFiles) {
      setStatus(`Procesando: ${file.name}`);
      
      ffmpeg.FS("writeFile", "input.mp4", await fetchFile(file));
      await ffmpeg.run(
        "-i", "input.mp4",
        "-b:v", "1000k",
        "-r", "30",
        "output.mp4"
      );

      const data = ffmpeg.FS("readFile", "output.mp4");
      const blob = new Blob([data.buffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `processed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setProgress((prev) => prev + (100 / currentFiles.length));
    }

    setStatus("Procesamiento completado");
    setCurrentFiles([]);
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileSelect} />
      <button onClick={processVideos}>Iniciar Procesamiento</button>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p>{status}</p>
    </div>
  );
};

export default ProgressComponent;
