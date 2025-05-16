import React, { useState, useEffect, useRef } from "react";

const ProgressComponent = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Seleccione archivos para procesar");
  const [currentFiles, setCurrentFiles] = useState([]);
  const ffmpegRef = useRef(null);

  // Carga dinámica de FFmpeg al iniciar procesamiento
  const loadFFmpeg = async () => {
    setStatus("Cargando FFmpeg...");
    if (!ffmpegRef.current) {
      const { createFFmpeg, fetchFile } = await import("@ffmpeg/ffmpeg");
      ffmpegRef.current = createFFmpeg({ log: true });
      ffmpegRef.current.fetchFile = fetchFile;
      await ffmpegRef.current.load();
    }
    setStatus("FFmpeg cargado");
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setCurrentFiles(files);
    setStatus(`${files.length} archivo(s) listo(s) para procesar.`);
    setProgress(0);
  };

  const processVideos = async () => {
    if (currentFiles.length === 0) {
      setStatus("Seleccione archivos primero.");
      return;
    }

    await loadFFmpeg();

    for (const file of currentFiles) {
      setStatus(`Procesando: ${file.name}`);

      const ffmpeg = ffmpegRef.current;
      ffmpeg.FS("writeFile", "input.mp4", await ffmpeg.fetchFile(file));
      await ffmpeg.run("-i", "input.mp4", "-b:v", "1000k", "-r", "30", "output.mp4");

      const data = ffmpeg.FS("readFile", "output.mp4");
      const blob = new Blob([data.buffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `processed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setProgress((prev) => prev + 100 / currentFiles.length);
    }

    setStatus("Procesamiento completado");
    setCurrentFiles([]);
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileSelect} />
      <button onClick={processVideos}>Iniciar Procesamiento</button>
      <div className="progress-bar" style={{border: '1px solid #000', width: '100%', height: '20px', marginTop: '10px'}}>
        <div
          className="progress-fill"
          style={{ width: `${progress}%`, height: '100%', backgroundColor: 'green' }}
        ></div>
      </div>
      <p>{status}</p>
    </div>
  );
};

export default ProgressComponent;
