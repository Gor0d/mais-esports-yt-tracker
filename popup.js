document.addEventListener('DOMContentLoaded', async () => {
  const storage = await chrome.storage.local.get(['lastVideo']);
  const statusDiv = document.getElementById('status');
  const thumbnailContainer = document.getElementById('thumbnailContainer');
  const watchButton = document.getElementById('watchButton');
  const contentDiv = document.querySelector('.content');
  
  if (storage.lastVideo) {
    // Mostrar informações do vídeo
    let videoDateDisplay = 'Data não disponível';
    
    if (storage.lastVideo.dateText) {
      videoDateDisplay = storage.lastVideo.dateText;
    } else if (storage.lastVideo.date) {
      const videoDate = new Date(storage.lastVideo.date);
      if (!isNaN(videoDate)) {
        videoDateDisplay = videoDate.toLocaleDateString('pt-BR');
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
      
      // Adicionar classe para indicar que há thumbnail
      contentDiv.classList.add('has-thumbnail');
      
      thumbnailContainer.style.display = 'block';
      thumbnailContainer.innerHTML = `
        <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" 
             alt="Thumbnail do vídeo" 
             class="thumbnail"
             id="videoThumbnail"
             loading="lazy">
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
      
      // Otimizar carregamento da imagem
      const thumbnailImg = document.getElementById('videoThumbnail');
      thumbnailImg.addEventListener('error', () => {
        // Se a thumbnail falhar, tentar thumbnail padrão
        thumbnailImg.src = `https://img.youtube.com/vi/${videoId}/default.jpg`;
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
    statusDiv.innerHTML = `
      <div class="info-item">
        <div class="label">Status:</div>
        <div class="value">Nenhuma verificação realizada ainda</div>
      </div>
      <div class="info-item">
        <div class="label">Ação:</div>
        <div class="value">Clique em "Verificar" para buscar o último vídeo</div>
      </div>
    `;
  }
  
  // Função para abrir o vídeo
  function openVideo(videoId) {
    chrome.tabs.create({ url: `https://youtube.com/watch?v=${videoId}` });
    // Fechar o popup após abrir o vídeo
    window.close();
  }
  
  // Adicionar botão de verificação manual
  const checkButton = document.getElementById('checkButton');
  checkButton.addEventListener('click', () => {
    // Atualizar interface para estado de carregamento
    statusDiv.innerHTML = '<div class="loading">🔄 Verificando novos vídeos...</div>';
    thumbnailContainer.style.display = 'none';
    watchButton.style.display = 'none';
    contentDiv.classList.remove('has-thumbnail');
    
    // Desabilitar botão temporariamente
    checkButton.disabled = true;
    checkButton.textContent = '⏳ Verificando...';
    
    chrome.runtime.sendMessage({action: 'checkNow'}, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Erro na comunicação:', chrome.runtime.lastError);
      }
    });
    
    // Reabilitar botão e recarregar popup após verificação
    setTimeout(() => {
      checkButton.disabled = false;
      checkButton.innerHTML = '🔄 Verificar';
      window.location.reload();
    }, 3000);
  });
  
  // Adicionar teclas de atalho
  document.addEventListener('keydown', (event) => {
    // Enter ou Espaço para verificar
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      checkButton.click();
    }
    
    // 'W' para assistir (se disponível)
    if (event.key.toLowerCase() === 'w' && storage.lastVideo?.id) {
      event.preventDefault();
      openVideo(storage.lastVideo.id);
    }
  });
  
  // Ajustar altura do popup dinamicamente
  function adjustPopupHeight() {
    const contentHeight = contentDiv.scrollHeight;
    const maxHeight = 600;
    const minHeight = 400;
    
    const idealHeight = Math.min(Math.max(contentHeight + 40, minHeight), maxHeight);
    document.body.style.height = `${idealHeight}px`;
  }
  
  // Ajustar altura após carregamento
  setTimeout(adjustPopupHeight, 100);
  
  // Observar mudanças no conteúdo para reajustar altura
  const observer = new MutationObserver(adjustPopupHeight);
  observer.observe(contentDiv, { 
    childList: true, 
    subtree: true, 
    attributes: true 
  });
});