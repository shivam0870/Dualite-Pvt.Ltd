import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';


function App() {
  const [selectedFrame, setSelectedFrame] = useState(null);

  useEffect(() => {
    
    const initializePlugin = async () => {
      const frameNodes = await figma.getPluginDataAsync('selectedFrame');
      setSelectedFrame(frameNodes);
    };

    initializePlugin();
    figma.on('selectionchange', () => {
      const frameNodes = figma.currentPage.selection.filter(node => node.type === 'FRAME');
      setSelectedFrame(frameNodes[0] || null);
    });
  }, []);

  const exportFrame = async () => {
    if (!selectedFrame) return;

    const frameNode = selectedFrame;

   
    const { width, height } = frameNode.absoluteBoundingBox;

    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    
    await html2canvas(frameNode, {
      canvas,
      width,
      height,
      useCORS: true, 
    });

  
    const imageData = canvas.toDataURL('image/png');

   
    const htmlCode = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Exported Frame</title>
        <style>
          html, body {
            margin: 0;
            padding: 0;
          }

          #frame {
            position: absolute;
            top: 0;
            left: 0;
            width: ${width}px;
            height: ${height}px;
            background-image: url('${imageData}');
            background-size: contain;
            background-repeat: no-repeat;
          }
        </style>
      </head>
      <body>
        <div id="frame"></div>
      </body>
      </html>
    `;

   
    const zip = new JSZip();

 
    zip.file('index.html', htmlCode);

   
    zip.generateAsync({ type: 'blob' }).then((blob) => {
     
      saveAs(blob, 'exported-frame.zip');
    });
  };

  return (
    <div>
      <h1>Figma Plugin</h1>
      {selectedFrame ? (
        <div>
          <p>Selected frame: {selectedFrame.name}</p>
          <button onClick={exportFrame}>Export Frame</button>
        </div>
      ) : (
        <p>No frame selected.</p>
      )}
    </div>
  );
}

export default App;
