import React, { useState, useRef, useCallback, useEffect } from "react";

const ProgressComponent = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Arrastra y suelta archivos MP4 aquí");
  const [currentFiles, setCurrentFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const ffmpegRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
      setStatus("Suelta los archivos aquí");
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      setStatus("Arrastra y suelta archivos MP4 aquí");
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      
      const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'video/mp4');
      
      if (files.length > 0) {
        setCurrentFiles(files);
        setStatus(`${files.length} archivo(s) MP4 listo(s) para procesar.`);
        setProgress(0);
      } else {
        setStatus("Solo se permiten archivos MP4");
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(file => file.type === 'video/mp4');
    
    if (files.length > 0) {
      setCurrentFiles(files);
      setStatus(`${files.length} archivo(s) MP4 listo(s) para procesar.`);
      setProgress(0);
    } else {
      setStatus("Solo se permiten archivos MP4");
    }
  };

  return (
    <div>
      <div 
        style={{
          border: isDragOver ? '2px solid green' : '2px dashed #ccc', 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: isDragOver ? 'rgba(0,255,0,0.1)' : 'transparent'
        }}
      >
        {status}
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept=".mp4" 
          onChange={handleFileSelect} 
          style={{display: 'none'}} 
        />
        <button onClick={() => fileInputRef.current.click()}>
          Seleccionar Archivos
        </button>
      </div>
      <button 
        onClick={processVideos} 
        disabled={currentFiles.length === 0}
      >
        Iniciar Procesamiento
      </button>
      <div className="progress-bar" style={{border: '1px solid #000', width: '100%', height: '20px', marginTop: '10px'}}>
        <div
          className="progress-fill"
          style={{ width: `${progress}%`, height: '100%', backgroundColor: 'green' }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressComponent;
