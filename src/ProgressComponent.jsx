import React, { useState, useRef, useEffect } from "react";

const ProgressComponent = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Arrastra y suelta archivos MP4 aquí");
  const [currentFiles, setCurrentFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    const dropZone = document.getElementById('drop-zone');
    
    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const highlight = () => {
      setIsDragOver(true);
      setStatus("Suelta los archivos aquí");
    };

    const unhighlight = () => {
      setIsDragOver(false);
      setStatus("Arrastra y suelta archivos MP4 aquí");
    };

    const handleDrop = (e) => {
      preventDefaults(e);
      unhighlight();
      
      const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'video/mp4');
      
      if (files.length > 0) {
        setCurrentFiles(files);
        setStatus(`${files.length} archivo(s) MP4 listo(s) para procesar.`);
        setProgress(0);
      } else {
        setStatus("Solo se permiten archivos MP4");
      }
    };

    if (dropZone) {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
      });

      dropZone.addEventListener('dragenter', highlight, false);
      dropZone.addEventListener('dragover', highlight, false);
      dropZone.addEventListener('dragleave', unhighlight, false);
      dropZone.addEventListener('drop', handleDrop, false);
    }

    return () => {
      if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
          dropZone.removeEventListener(eventName, preventDefaults, false);
        });

        dropZone.removeEventListener('dragenter', highlight, false);
        dropZone.removeEventListener('dragover', highlight, false);
        dropZone.removeEventListener('dragleave', unhighlight, false);
        dropZone.removeEventListener('drop', handleDrop, false);
      }
    };
  }, []);

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

  const processVideos = async () => {
    if (currentFiles.length === 0) {
      setStatus("Seleccione archivos primero.");
      return;
    }

    // Aquí iría la lógica de procesamiento de FFmpeg
    setStatus("Procesamiento completado");
    setCurrentFiles([]);
  };

  return (
    <div>
      <div 
        id="drop-zone"
        ref={dropZoneRef}
        style={{
          border: isDragOver ? '3px solid green' : '3px dashed #ccc', 
          padding: '40px', 
          textAlign: 'center', 
          backgroundColor: isDragOver ? 'rgba(0,255,0,0.1)' : 'white',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        <p>{status}</p>
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept=".mp4" 
          onChange={handleFileSelect} 
          style={{display: 'none'}} 
        />
        <button 
          onClick={() => fileInputRef.current.click()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Seleccionar Archivos
        </button>
      </div>
      
      {currentFiles.length > 0 && (
        <div style={{marginTop: '20px'}}>
          <h3>Archivos seleccionados:</h3>
          <ul>
            {currentFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
          <button 
            onClick={processVideos}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Procesar Videos
          </button>
        </div>
      )}

      {progress > 0 && (
        <div 
          className="progress-bar" 
          style={{
            border: '1px solid #000', 
            width: '100%', 
            height: '20px', 
            marginTop: '10px'
          }}
        >
          <div
            className="progress-fill"
            style={{ 
              width: `${progress}%`, 
              height: '100%', 
              backgroundColor: 'green' 
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default ProgressComponent;
