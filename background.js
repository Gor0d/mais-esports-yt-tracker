const CHANNEL_ID = 'UCMM1aoTVRH6j3h_GDMYuUvw'; // MaisEsports
const CHANNEL_URL = `https://www.youtube.com/channel/${CHANNEL_ID}/videos`; // Página de vídeos (não inclui Shorts)
let videoId = '';

async function checkNewVideo() {
  try {
    console.log('Iniciando verificação de novos vídeos do MaisEsports (apenas vídeos longos)');
    
    // Método 1: RSS feed filtrado
    try {
      console.log('Verificando RSS feed...');
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
      const rssResponse = await fetch(rssUrl);
      
      if (rssResponse.ok) {
        const xmlText = await rssResponse.text();
        
        // Extrair todas as entries
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        const entries = [...xmlText.matchAll(entryRegex)];
        
        console.log(`Encontradas ${entries.length} entries no feed`);
        
        for (const entryMatch of entries) {
          const entryContent = entryMatch[1];
          
          const videoIdRegex = /<yt:videoId>(.*?)<\/yt:videoId>/;
          const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
          const publishedRegex = /<published>(.*?)<\/published>/;
          
          const videoIdMatch = entryContent.match(videoIdRegex);
          const titleMatch = entryContent.match(titleRegex);
          const publishedMatch = entryContent.match(publishedRegex);
          
          if (videoIdMatch && titleMatch) {
            const currentVideoId = videoIdMatch[1];
            const title = (titleMatch[1] || titleMatch[2] || 'Novo vídeo do MaisEsports').trim();
            const publishedDate = publishedMatch ? publishedMatch[1] : new Date().toISOString();
            
            // Verificar se não é um Short usando método simples
            const isNotShort = await isVideoNotShort(currentVideoId);
            
            if (isNotShort) {
              console.log('✅ Vídeo longo encontrado:', { 
                id: currentVideoId, 
                title: title,
                published: publishedDate 
              });
              
              // Verificar se é novo
              const storage = await chrome.storage.local.get(['lastVideo']);
              
              if (!storage.lastVideo || storage.lastVideo.id !== currentVideoId) {
                console.log('🎮 Novo vídeo do MaisEsports detectado!');
                videoId = currentVideoId;
                showNotification(title);
                
                const now = new Date();
                chrome.storage.local.set({ 
                  lastVideo: { 
                    id: currentVideoId,
                    title: title,
                    date: publishedDate,
                    checked: now.toLocaleString(),
                    thumbnailUrl: `https://img.youtube.com/vi/${currentVideoId}/mqdefault.jpg`
                  }
                });
                return;
              } else {
                console.log('Vídeo já conhecido, continuando verificação...');
                return;
              }
            } else {
              console.log('⏩ Pulando Short:', title);
            }
          }
        }
      }
    } catch (rssError) {
      console.error('Erro no RSS:', rssError);
    }
    
    // Método 2: Backup via página /videos (que geralmente não inclui Shorts)
    try {
      console.log('Tentando método backup via página /videos...');
      const response = await fetch(CHANNEL_URL);
      
      if (response.ok) {
        const html = await response.text();
        
        // A página /videos geralmente mostra apenas vídeos longos
        const videoIdRegex = /\/watch\?v=([a-zA-Z0-9_-]{11})/;
        const videoIdMatch = html.match(videoIdRegex);
        
        if (videoIdMatch) {
          const currentVideoId = videoIdMatch[1];
          
          // Extrair título
          let title = 'Novo vídeo do MaisEsports';
          const titlePatterns = [
            /"videoRenderer":\{[^}]*"title":\{"runs":\[\{"text":"([^"]+)"/,
            /"gridVideoRenderer":\{[^}]*"title":\{"runs":\[\{"text":"([^"]+)"/,
            new RegExp(`"videoId":"${currentVideoId}"[^}]*"title":\\{"runs":\\[\\{"text":"([^"]+)"`, 'i')
          ];
          
          for (const pattern of titlePatterns) {
            const titleMatch = html.match(pattern);
            if (titleMatch && titleMatch[1] && !['Início', 'Home'].includes(titleMatch[1])) {
              title = titleMatch[1]
                .replace(/\\u0026/g, '&')
                .replace(/\\"/g, '"')
                .trim();
              break;
            }
          }
          
          console.log('Vídeo encontrado via página /videos:', { id: currentVideoId, title });
          
          const storage = await chrome.storage.local.get(['lastVideo']);
          
          if (!storage.lastVideo || storage.lastVideo.id !== currentVideoId) {
            console.log('Novo vídeo detectado via backup!');
            videoId = currentVideoId;
            showNotification(title);
            
            const now = new Date();
            chrome.storage.local.set({ 
              lastVideo: { 
                id: currentVideoId,
                title: title,
                date: now.toISOString(),
                checked: now.toLocaleString(),
                thumbnailUrl: `https://img.youtube.com/vi/${currentVideoId}/mqdefault.jpg`
              }
            });
          }
        }
      }
    } catch (backupError) {
      console.error('Erro no método backup:', backupError);
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Função simples para verificar se é vídeo longo (não Short)
async function isVideoNotShort(videoId) {
  try {
    // Método 1: Tentar acessar URL de Short - se der 404, não é Short
    const shortsResponse = await fetch(`https://www.youtube.com/shorts/${videoId}`, { 
      method: 'HEAD',
      redirect: 'manual' // Não seguir redirects
    });
    
    // Se status for 200-299, é um Short
    // Se for 404 ou outro erro, provavelmente é vídeo longo
    const isShort = shortsResponse.ok || shortsResponse.status === 302;
    
    console.log(`Vídeo ${videoId}: status ${shortsResponse.status} - é Short: ${isShort}`);
    return !isShort;
    
  } catch (error) {
    // Em caso de erro na verificação, assume que é vídeo longo
    console.log(`Erro verificando ${videoId}, assumindo vídeo longo`);
    return true;
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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'checkNow') {
    console.log('Verificação manual solicitada');
    checkNewVideo();
    sendResponse({status: 'verificando'});
  }
  return true;
});

// Verificação inicial 
chrome.storage.local.get(['lastVideo'], function(result) {
  console.log('Dados iniciais:', result);
  // Para forçar nova detecção, descomente:
  // chrome.storage.local.remove(['lastVideo']);
  
  setTimeout(checkNewVideo, 3000);
});