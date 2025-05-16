import React, { useState, useRef } from "react";

const ProgressComponent = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Selecciona archivos MP4 para procesar");
  const [currentFiles, setCurrentFiles] = useState([]);
  const fileInputRef = useRef(null);

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

    try {
      // Simulación de procesamiento de videos
      for (const file of currentFiles) {
        setStatus(`Procesando: ${file.name}`);
        // Aquí iría la lógica real de procesamiento con FFmpeg
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación de procesamiento
        setProgress((prev) => prev + 100 / currentFiles.length);
      }
      
      setStatus("Procesamiento completado");
    } catch (error) {
      setStatus("Error en el procesamiento");
    } finally {
      setCurrentFiles([]);
    }
  };

  return (
    <div style={{maxWidth: '500px', margin: '0 auto', padding: '20px'}}>
      <div style={{
        border: '2px dashed #ccc', 
        padding: '20px', 
        textAlign: 'center', 
        marginBottom: '20px'
      }}>
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
          Adjuntar Archivos MP4
        </button>
        <p style={{marginTop: '10px', color: '#666'}}>{status}</p>
      </div>
      
      {currentFiles.length > 0 && (
        <div>
          <h3>Archivos seleccionados:</h3>
          <ul style={{listStyleType: 'none', padding: 0}}>
            {currentFiles.map((file, index) => (
              <li 
                key={index} 
                style={{
                  backgroundColor: '#f4f4f4', 
                  margin: '5px 0', 
                  padding: '10px', 
                  borderRadius: '5px'
                }}
              >
                {file.name}
              </li>
            ))}
          </ul>
          <button 
            onClick={processVideos}
            style={{
              width: '100%',
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
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
            border: '1px solid #ddd', 
            width: '100%', 
            height: '20px', 
            marginTop: '10px',
            borderRadius: '10px',
            overflow: 'hidden'
          }}
        >
          <div
            className="progress-fill"
            style={{ 
              width: `${progress}%`, 
              height: '100%', 
              backgroundColor: '#28a745',
              transition: 'width 0.5s ease-in-out'
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default ProgressComponent;
