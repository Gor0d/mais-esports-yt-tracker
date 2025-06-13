// Este script não será executado automaticamente, apenas quando solicitado pelo background
function extractLatestVideoInfo() {
    // Tenta encontrar o primeiro vídeo listado
    const videoElements = document.querySelectorAll('ytd-grid-video-renderer, ytd-video-renderer');
    
    if (videoElements.length === 0) {
      return { error: "Não foi possível encontrar vídeos na página" };
    }
    
    const firstVideo = videoElements[0];
    
    // Encontra o link do vídeo e extrai o ID
    const videoLink = firstVideo.querySelector('a#thumbnail');
    if (!videoLink) {
      return { error: "Não foi possível encontrar o link do vídeo" };
    }
    
    const videoUrl = videoLink.href;
    const videoId = videoUrl.split('v=')[1]?.split('&')[0];
    
    if (!videoId) {
      return { error: "Não foi possível extrair o ID do vídeo" };
    }
    
    // Encontra o título do vídeo
    const titleElement = firstVideo.querySelector('#video-title, #title-wrapper');
    const title = titleElement ? titleElement.textContent.trim() : "Título não disponível";
    
    // Encontra a data de publicação
    const dateElement = firstVideo.querySelector('#metadata-line .ytd-video-meta-block, span.ytd-video-meta-block');
    const publishedText = dateElement ? dateElement.textContent.trim() : "";
    
    // Convertendo texto de data relativa para uma data aproximada
    const now = new Date();
    let publishedDate = now.toISOString();
    
    if (publishedText.includes('hora') || publishedText.includes('hours') || publishedText.includes('hour')) {
      const hours = parseInt(publishedText.match(/\d+/)[0]) || 1;
      now.setHours(now.getHours() - hours);
      publishedDate = now.toISOString();
    } else if (publishedText.includes('dia') || publishedText.includes('days') || publishedText.includes('day')) {
      const days = parseInt(publishedText.match(/\d+/)[0]) || 1;
      now.setDate(now.getDate() - days);
      publishedDate = now.toISOString();
    } else if (publishedText.includes('semana') || publishedText.includes('weeks') || publishedText.includes('week')) {
      const weeks = parseInt(publishedText.match(/\d+/)[0]) || 1;
      now.setDate(now.getDate() - (weeks * 7));
      publishedDate = now.toISOString();
    } else if (publishedText.includes('mês') || publishedText.includes('months') || publishedText.includes('month')) {
      const months = parseInt(publishedText.match(/\d+/)[0]) || 1;
      now.setMonth(now.getMonth() - months);
      publishedDate = now.toISOString();
    }
    
    return {
      id: videoId,
      title: title,
      date: publishedDate,
      dateText: publishedText
    };
  }
  
  // Enviar as informações de volta para o background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getLatestVideo') {
      const videoInfo = extractLatestVideoInfo();
      sendResponse(videoInfo);
    }
    return true; // Mantém o canal de comunicação aberto para resposta assíncrona
  });