const CHANNEL_ID = 'UCMM1aoTVRH6j3h_GDMYuUvw'; // MaisEsports
const CHANNEL_URL = `https://www.youtube.com/channel/${CHANNEL_ID}/videos`;
let videoId = '';

async function checkNewVideo() {
  try {
    console.log('Iniciando verificação de novos vídeos do MaisEsports');
    
    // Tenta primeiro usar o método de scripting para obter informações do vídeo mais recente
    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      
      // Se não tiver uma aba ativa, cria uma nova temporária
      let createdTab = null;
      if (!tab) {
        createdTab = await chrome.tabs.create({
          url: CHANNEL_URL,
          active: false
        });
      }
      
      // Espera a página carregar
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Executa o script na página para extrair informações
      const targetTab = createdTab || tab;
      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        files: ['content.js']
      });
      
      // Solicita as informações do vídeo mais recente
      const result = await chrome.tabs.sendMessage(targetTab.id, { action: 'getLatestVideo' });
      
      // Se criou uma aba temporária, fecha ela depois
      if (createdTab) {
        await chrome.tabs.remove(createdTab.id);
      }
      
      if (result && result.id) {
        const newVideoId = result.id;
        const title = result.title;
        const publishedDate = result.date;
        
        console.log('Vídeo mais recente do MaisEsports encontrado:', { newVideoId, title, publishedDate });
        
        // Verificar se é um vídeo novo
        const storage = await chrome.storage.local.get(['lastVideo']);
        console.log('Último vídeo armazenado:', storage.lastVideo);
        
        if (!storage.lastVideo || storage.lastVideo.id !== newVideoId) {
          console.log('Novo vídeo do MaisEsports detectado!');
          videoId = newVideoId;
          showNotification(title);
          
          const now = new Date();
          chrome.storage.local.set({ 
            lastVideo: { 
              id: newVideoId,
              title: title,
              date: publishedDate,
              dateText: result.dateText || '',
              checked: now.toLocaleString(),
              thumbnailUrl: `https://img.youtube.com/vi/${newVideoId}/mqdefault.jpg`
            }
          });
        } else {
          console.log('Nenhum vídeo novo do MaisEsports desde a última verificação');
        }
        
        return; // Termina a função aqui se bem-sucedido
      }
    } catch (scriptError) {
      console.error('Erro no método de scripting:', scriptError);
      // Continua para o método alternativo
    }
    
    // Método alternativo - usar fetch diretamente na página do canal
    const response = await fetch(CHANNEL_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extrair informações do vídeo mais recente usando regex
    const videoIdRegex = /\/watch\?v=([a-zA-Z0-9_-]{11})/;
    const videoIdMatch = html.match(videoIdRegex);
    
    if (!videoIdMatch) {
      console.error('Não foi possível encontrar IDs de vídeo na página do MaisEsports');
      return;
    }
    
    const newVideoId = videoIdMatch[1];
    
    // Extrair título (pode ser impreciso com regex)
    const titleRegex = /"title":\s*{\s*"runs":\s*\[\s*{\s*"text":\s*"([^"]+)"/;
    const titleMatch = html.match(titleRegex);
    const title = titleMatch ? titleMatch[1] : 'Título não disponível';
    
    const now = new Date();
    const publishedDate = now.toISOString();
    
    // Verificar se é um vídeo novo
    const storage = await chrome.storage.local.get(['lastVideo']);
    
    if (!storage.lastVideo || storage.lastVideo.id !== newVideoId) {
      console.log('Novo vídeo do MaisEsports detectado!');
      videoId = newVideoId;
      showNotification(title);
      
      chrome.storage.local.set({ 
        lastVideo: { 
          id: newVideoId,
          title: title,
          date: publishedDate,
          checked: now.toLocaleString(),
          thumbnailUrl: `https://img.youtube.com/vi/${newVideoId}/mqdefault.jpg`
        }
      });
    } else {
      console.log('Nenhum vídeo novo do MaisEsports desde a última verificação');
    }
    
  } catch (error) {
    console.error('Erro na verificação do MaisEsports:', error);
  }
}

function showNotification(title) {
  chrome.notifications.create('newVideo', {
    type: 'basic',
    iconUrl: 'maisesports.png',
    title: '🎮 Novo Vídeo do MaisEsports!',
    message: title,
    buttons: [{ title: '▶️ Assistir' }],
    priority: 2
  });
}

// Configuração dos listeners
chrome.alarms.create('checkVideos', { delayInMinutes: 1, periodInMinutes: 15 });
chrome.alarms.onAlarm.addListener(checkNewVideo);

chrome.notifications.onButtonClicked.addListener(() => {
  chrome.tabs.create({ url: `https://youtube.com/watch?v=${videoId}` });
});

// Adicionar listener para verificação manual
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'checkNow') {
    console.log('Verificação manual do MaisEsports solicitada');
    checkNewVideo();
    sendResponse({status: 'verificando'});
  }
  return true;
});

// Verificação inicial 
chrome.storage.local.get(['lastVideo'], function(result) {
  console.log('Dados iniciais do MaisEsports armazenados:', result);
  // Descomente a linha abaixo para forçar uma nova detecção
   chrome.storage.local.remove(['lastVideo']);
  
  // Atrasa um pouco a verificação inicial
  setTimeout(checkNewVideo, 3000);
});