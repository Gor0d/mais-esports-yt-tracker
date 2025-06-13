document.addEventListener('DOMContentLoaded', async () => {
  const storage = await chrome.storage.local.get(['lastVideo']);
  const statusDiv = document.getElementById('status');
  const thumbnailContainer = document.getElementById('thumbnailContainer');
  const watchButton = document.getElementById('watchButton');
  
  if (storage.lastVideo) {
    // Mostrar informações do vídeo
    let videoDateDisplay = 'Data não disponível';
    
    if (storage.lastVideo.dateText) {
      videoDateDisplay = storage.lastVideo.dateText;
    } else if (storage.lastVideo.date) {
      const videoDate = new Date(storage.lastVideo.date);
      if (!isNaN(videoDate)) {
        videoDateDisplay = videoDate.toLocaleDateString();
      }
    }
    
    statusDiv.innerHTML = `
      <div class="info-item">
        <div class="label">Última verificação:</div>
        <div class="value">${storage.lastVideo.checked}</div>
      </div>
      
      <div class="info-item">
        <div class="label">Último vídeo detectado:</div>
        <div class="value">${videoDateDisplay}</div>
      </div>
      
      <div class="info-item">
        <div class="label">Título:</div>
        <div class="value">${storage.lastVideo.title || 'Não disponível'}</div>
      </div>
    `;
    
    // Exibir thumbnail do vídeo
    if (storage.lastVideo.id) {
      const videoId = storage.lastVideo.id;
      
      // Existem vários tamanhos de thumbnail disponíveis do YouTube:
      // default.jpg (120x90)
      // mqdefault.jpg (320x180)
      // hqdefault.jpg (480x360)
      // sddefault.jpg (640x480)
      // maxresdefault.jpg (1280x720)
      
      thumbnailContainer.style.display = 'block';
      thumbnailContainer.innerHTML = `
        <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" 
             alt="Thumbnail do vídeo" 
             class="thumbnail"
             id="videoThumbnail">
      `;
      
      // Exibir o botão de assistir e configurar o clique
      watchButton.style.display = 'block';
      
      // Configurar clique na thumbnail e no botão para abrir o vídeo
      document.getElementById('videoThumbnail').addEventListener('click', () => {
        openVideo(videoId);
      });
      
      watchButton.addEventListener('click', () => {
        openVideo(videoId);
      });
    } else {
      thumbnailContainer.style.display = 'block';
      thumbnailContainer.innerHTML = `
        <div class="no-thumbnail">
          Thumbnail não disponível
        </div>
      `;
    }
  } else {
    statusDiv.textContent = 'Nenhuma verificação realizada ainda';
  }
  
  // Função para abrir o vídeo
  function openVideo(videoId) {
    chrome.tabs.create({ url: `https://youtube.com/watch?v=${videoId}` });
  }
  
  // Adicionar botão de verificação manual
  const checkButton = document.getElementById('checkButton');
  checkButton.addEventListener('click', () => {
    statusDiv.innerHTML = '<div class="loading">Verificando...</div>';
    thumbnailContainer.style.display = 'none';
    watchButton.style.display = 'none';
    
    chrome.runtime.sendMessage({action: 'checkNow'});
    
    // Recarregar popup após verificação
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  });
});