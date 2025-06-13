# 🎮 Notificador MaisEsports

![Status](https://img.shields.io/badge/status-teste-orange)
![Version](https://img.shields.io/badge/version-1.0-blue)
![Platform](https://img.shields.io/badge/platform-Chrome-green)

Uma extensão experimental para o Chrome que monitora o canal **MaisEsports** no YouTube e envia notificações quando novos vídeos são publicados.

> ⚠️ **Projeto de Teste**: Esta é uma extensão experimental desenvolvida para fins de aprendizado e testes. Não é um produto oficial do MaisEsports.

## 📋 Funcionalidades

- ✅ **Monitoramento Automático**: Verifica novos vídeos a cada 15 minutos
- 🔔 **Notificações Desktop**: Alertas instantâneos quando um novo vídeo é detectado
- 🖼️ **Preview do Vídeo**: Visualiza a thumbnail do último vídeo no popup
- ▶️ **Acesso Rápido**: Botão direto para assistir ao vídeo no YouTube
- 🔄 **Verificação Manual**: Opção para verificar manualmente por novos conteúdos
- 🎨 **Visual Personalizado**: Interface inspirada na identidade visual do MaisEsports

## 🚀 Instalação

### Método 1: Instalação Manual (Recomendado para testes)

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/Gor0d/mais-esports-yt-tracker.git
   cd mais-esports-yt-tracker
   ```

2. **Abra o Chrome e acesse**:
   ```
   chrome://extensions/
   ```

3. **Ative o modo desenvolvedor** (toggle no canto superior direito)

4. **Clique em "Carregar sem compactação"** e selecione a pasta do projeto

5. **A extensão será instalada** e aparecerá na barra de ferramentas

### Método 2: Arquivo .zip

1. Baixe o arquivo .zip da [última release](https://github.com/Gor0d/mais-esports-yt-tracker/releases)
2. Extraia o conteúdo
3. Siga os passos 2-5 do método anterior

## 🔧 Configuração

Não há configuração necessária! A extensão funciona imediatamente após a instalação:

- **Canal Monitorado**: MaisEsports (ID: `UCMM1aoTVRH6j3h_GDMYuUvw`)
- **Intervalo de Verificação**: 15 minutos
- **Notificações**: Habilitadas por padrão

## 📂 Estrutura do Projeto

```
📁 mais-esports-yt-tracker/
├── 📄 manifest.json          # Configurações da extensão
├── 📄 background.js          # Lógica de monitoramento
├── 📄 popup.html            # Interface do popup
├── 📄 popup.js              # Funcionalidades do popup
├── 📄 content.js            # Script de conteúdo para YouTube
├── 🖼️ maisesports.png        # Logo personalizada
└── 📄 README.md             # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

- **Manifest V3**: Última versão da API de extensões do Chrome
- **JavaScript ES6+**: Programação moderna com async/await
- **Chrome APIs**:
  - `chrome.alarms` - Agendamento de verificações
  - `chrome.notifications` - Notificações desktop
  - `chrome.storage` - Armazenamento local
  - `chrome.scripting` - Injeção de scripts
- **CSS3**: Animações e efeitos visuais modernos
- **YouTube**: Integração não-oficial via scraping

## ⚙️ Como Funciona

1. **Monitoramento**: A extensão verifica o canal do MaisEsports periodicamente
2. **Detecção**: Compara o último vídeo encontrado com o armazenado localmente
3. **Notificação**: Se um novo vídeo for detectado, exibe uma notificação
4. **Armazenamento**: Salva informações do último vídeo para próximas comparações

### Métodos de Detecção

A extensão utiliza duas estratégias para maior confiabilidade:

1. **Content Script**: Injeta código na página do YouTube para extrair dados
2. **Fallback HTTP**: Busca direta no HTML da página como backup

## 🐛 Limitações Conhecidas

- ⚠️ **Dependência do YouTube**: Pode parar de funcionar se o YouTube alterar sua estrutura
- ⏱️ **Atraso na Detecção**: Pode levar até 15 minutos para detectar novos vídeos
- 🔒 **Apenas Chrome**: Compatível apenas com navegadores Chromium
- 📊 **Sem API Oficial**: Utiliza métodos não-oficiais de coleta de dados

## 🧪 Status do Projeto

**Este é um projeto experimental** com os seguintes objetivos:

- [x] Aprender desenvolvimento de extensões Chrome
- [x] Testar integração com YouTube sem API oficial
- [x] Implementar notificações desktop
- [x] Criar interface visual atrativa
- [ ] Adicionar suporte para múltiplos canais
- [ ] Implementar configurações personalizáveis
- [ ] Otimizar performance e uso de recursos

## 🤝 Contribuindo

Como este é um projeto de teste, contribuições são bem-vindas para fins educacionais:

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ⚖️ Disclaimer

- Este projeto **NÃO é oficial** do MaisEsports
- Desenvolvido apenas para fins **educacionais e experimentais**
- **Não coleta dados pessoais** dos usuários
- **Não monetiza** ou comercializa informações
- Respeita os **termos de uso** do YouTube

## 📞 Contato

Se você tiver dúvidas sobre este projeto experimental:

- 📧 **Email**: emersongsguimaraes@gmail.com
- 🐙 **GitHub**: [@Gor0d](https://github.com/Gor0d)
- 💬 **Issues**: [Reportar problema](https://github.com/Gor0d/mais-esports-yt-tracker/issues)

---

**Feito com ❤️ para a comunidade de esports brasileira**

> "Esta extensão foi criada por fãs, para fãs do MaisEsports. Não perca mais nenhum conteúdo do seu portal de notícias de esports favorito!"
