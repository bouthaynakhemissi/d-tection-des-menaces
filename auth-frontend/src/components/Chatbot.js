import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 320px;
  height: 420px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
  transition: all 0.3s ease;
  
  @media (max-width: 480px) {
    width: 90%;
    right: 5%;
    bottom: 20px;
    height: 70vh;
  }
`;

const ChatHeader = styled.div`
  background: #2c3e50;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const ChatBody = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Message = styled.div`
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 15px;
  margin-bottom: 10px;
  word-wrap: break-word;
  ${props => props.isUser ? 
    'align-self: flex-end; background: #2c3e50; color: white;' : 
    'align-self: flex-start; background: #f1f1f1; color: #333;'}
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  background: #2c3e50;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  margin-right: 10px;
  font-size: 14px;
  &:hover {
    background: #1a252f;
  }
`;

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  margin-right: 10px;
`;

const SendButton = styled.button`
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #1a252f;
  }
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #45a049;
    transform: scale(1.1);
  }
`;

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      text: "Bonjour ! Je suis votre assistant en sécurité. Vous pouvez me poser des questions ou m'envoyer des images pour analyse.", 
      sender: 'assistant' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newMessage = {
        text: `Fichier: ${file.name}`,
        sender: 'user'
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Réinitialiser le champ de fichier après l'upload
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Réponse générique pour les fichiers
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "J'ai bien reçu votre fichier. Comment puis-je vous aider avec celui-ci ?", 
          sender: 'assistant' 
        }]);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const getSecurityResponse = (userInput) => {
    const securityResponses = {
      'yara': {
        pattern: ['yara', 'règle yara', 'signature yara', 'créer une règle yara'],
        response: "🔍 **YARA - Outil de détection de menaces avancé**\n\n" +
          "YARA est un outil puissant pour la détection et la classification de logiciels malveillants basé sur des règles.\n\n" +
          "**Fonctionnalités avancées :**\n" +
          "- Création de règles complexes avec conditions booléennes\n" +
          "- Support des expressions régulières et des chaînes hexadécimales\n" +
          "- Modules pour l'analyse de fichiers PE, ELF, etc.\n" +
          "- Intégration avec d'autres outils de sécurité"
      },
      'sigma': {
        pattern: ['sigma', 'règle sigma', 'détection sigma'],
        response: "📜 **Sigma - Standard pour les règles de détection**\n\n" +
          "Sigma est un format open-source pour la description des règles de détection d'activités suspectes dans les journaux.\n\n" +
          "**Avantages clés :**\n" +
          "- Format indépendant du fournisseur SIEM\n" +
          "- Large bibliothèque de règles partagées\n" +
          "- Facilement maintenable et versionnable\n\n" +
          "**Exemple de règle Sigma :**\n```yaml\ntitle: Suspicious PowerShell Download\nid: 2f0d0cb3-33ec-4f09-9142-7bd1db7e01b1\nstatus: test\ndescription: Detects suspicious PowerShell download\nreferences:\n    - https://www.crowdstrike.com/blog/observations-from-the-front-lines-of-threat-hunting/\nauthor: Florian Roth\ndate: 2019/09/11\nmodified: 2023/01/01\nlogsource:\n    product: windows\n    service: powershell\ndetection:\n    selection:\n        EventID: 4103\n        ScriptBlockText|contains:\n            - 'Invoke-WebRequest'\n            - 'DownloadString'\n    filter:\n        ScriptBlockText|contains:\n            - 'microsoft.com'\n            - 'windowsupdate.com'\n    condition: selection and not filter\nfalsepositives:\n    - Legitimate administrative activity\nlevel: high\ntags:\n    - attack.execution\n    - attack.t1059.001\n```\n\n" +
          "**Intégrations :**\n" +
          "- SIEM (Splunk, Elastic, QRadar, etc.)\n" +
          "- Outils de Threat Hunting\n" +
          "- Systèmes d'orchestration de sécurité"
      },
      'zircolite': {
        pattern: ['zircolite', 'zircolite logs', 'analyse logs windows'],
        response: "🔎 **Zircolite - Outil d'analyse avancée des logs Windows**\n\n" +
          "Zircolite est un outil open-source pour l'analyse rapide et l'enrichissement des journaux d'événements Windows (EVTX).\n\n" +
          "**Fonctionnalités principales :**\n" +
          "- Analyse rapide des logs EVTX\n" +
          "- Support des règles Sigma\n" +
          "- Génération de rapports détaillés\n" +
          "- Mode distribué pour le traitement à grande échelle\n\n" +
          "**Cas d'utilisation :**\n" +
          "- Investigation d'incident de sécurité\n" +
          "- Détection d'activités suspectes\n" +
          "- Conformité et audit\n\n" +
          "**Exemple de commande :**\n```bash\n# Analyse basique\nzircolite.py --evtx logs/ --ruleset rules/rules_windows_sysmon.json\n\n# Avec règles Sigma\nzircolite.py --evtx logs/ --sigma rules/sigma/ --outfile results.json\n\n# Génération de rapport HTML\nzircolite.py --evtx logs/ --ruleset rules/rules_windows_generic.json --format html\n```"
      },
      'loki': {
        pattern: ['loki', 'loki scanner', 'détection ioc'],
        response: "🛡️ **LOKI - Détecteur d'IoCs**\n\n" +
          "LOKI est un scanner d'Indicateurs de Compromission (IoC) open-source pour les systèmes Windows.\n\n" +
          "**Fonctionnalités clés :**\n" +
          "- Détection basée sur les signatures YARA\n" +
          "- Analyse des processus en cours\n" +
          "- Vérification des hachages de fichiers\n" +
          "- Détection des connexions réseau suspectes\n\n" +
          "**Types d'IoCs détectés :**\n" +
          "- Fichiers malveillants\n" +
          "- Processus suspects\n" +
          "- Clés de registre malveillantes\n" +
          "- Connexions réseau suspectes\n\n" +
          "**Exemple d'utilisation :**\n```powershell\n# Analyse rapide\n.\\loki.exe -p .\\signatures\n\n# Analyse complète avec rapport\n.\\loki.exe -p .\\signatures -l .\\scan.log --noproc --dontwait --allhds --printall\""
      },
      'threat hunting': {
        pattern: ['threat hunting', 'cyber chasse', 'recherche de menaces', 'chasse aux menaces'],
        response: "🕵️ **Threat Hunting - Approche proactive de la sécurité**\n\n" +
          "Le Threat Hunting est une approche proactive qui consiste à rechercher activement des menaces qui ont échappé aux solutions de sécurité traditionnelles.\n\n" +
          "**Méthodologie MITRE ATT&CK :**\n" +
          "1. **Reconnaissance** - Collecte d'informations\n" +
          "2. **Développement des ressources** - Préparation des outils\n" +
          "3. **Accès initial** - Première compromission\n" +
          "4. **Exécution** - Exécution de code malveillant\n" +
          "5. **Persistence** - Maintien de l'accès\n" +
          "6. **Élévation de privilèges** - Obtention de droits élevés\n" +
          "7. **Évitement des défenses** - Contournement des sécurités\n\n" +
          "**Outils recommandés :**\n" +
          "- **SIEM** : Splunk, ELK, Microsoft Sentinel\n" +
          "- **EDR** : CrowdStrike, SentinelOne, Microsoft Defender ATP\n" +
          "- **Analyse réseau** : Wireshark, Zeek, Suricata\n" +
          "- **Analyse forensique** : Volatility, Autopsy, KAPE"
      },
      'siem': {
        pattern: ['siem', 'security information and event management', 'gestion des événements de sécurité'],
        response: "📊 **SIEM - Gestion des événements et des informations de sécurité**\n\n" +
          "Un SIEM est une solution qui fournit une analyse en temps réel des alertes de sécurité générées par les applications et le matériel réseau.\n\n" +
          "**Fonctionnalités avancées :**\n" +
          "- Agrégation et corrélation des logs en temps réel\n" +
          "- Détection des menaces avancées (APT, zero-day)\n" +
          "- Investigation et réponse aux incidents\n" +
          "- Conformité et rapports automatisés\n" +
          "- Intégration avec les outils de sécurité existants\n\n" +
          "**Workflow typique :**\n" +
          "1. Collecte des logs\n" +
          "2. Normalisation et enrichissement\n" +
          "3. Corrélation des événements\n" +
          "4. Génération d'alertes\n" +
          "5. Investigation et réponse\n\n" +
          "**Solutions avancées :**\n" +
          "- **Splunk** avec ES (Enterprise Security)\n" +
          "- **Microsoft Sentinel** avec intégration Azure\n" +
          "- **Elastic SIEM** avec machine learning\n" +
          "- **IBM QRadar** avec IA Watson"
      },
      'soc': {
        pattern: ['soc', 'security operations center', 'centre opérationnel de sécurité'],
        response: "🏢 **SOC - Centre Opérationnel de Sécurité**\n\n" +
          "Un SOC est une structure organisationnelle qui assure la surveillance continue de la sécurité des systèmes d'information.\n\n" +
          "**Équipe type du SOC :**\n" +
          "- **Niveau 1** : Analystes - Tri des alertes\n" +
          "- **Niveau 2** : Enquêteurs - Analyse approfondie\n" +
          "- **Niveau 3** : Experts - Réponse aux incidents\n" +
          "- **Responsable SOC** : Coordination et stratégie\n\n" +
          "**Outils essentiels :**\n" +
          "- **SIEM** : Centralisation des logs\n" +
          "- **SOAR** : Automatisation des tâches\n" +
          "- **EDR/XDR** : Protection des terminaux\n" +
          "- **Threat Intelligence** : Veille stratégique\n\n" +
          "**Indicateurs clés (KPIs) :**\n" +
          "- MTTR (Mean Time To Respond)\n" +
          "- Nombre d'incidents par gravité\n" +
          "- Taux de faux positifs\n" +
          "- Couverture de détection"
      },
      'malware': {
        pattern: ['malware', 'logiciel malveillant', 'virus', 'rançongiciel', 'trojan', 'backdoor'],
        response: "🦠 **Analyse de Malware**\n\n" +
          "Les logiciels malveillants sont des programmes conçus pour endommager ou accéder de manière non autorisée à des systèmes informatiques.\n\n" +
          "**Types principaux :**\n" +
          "- **Virus** : S'attache à des fichiers propres\n" +
          "- **Vers** : Se propagent automatiquement\n" +
          "- **Troyens** : Se font passer pour des logiciels légitimes\n" +
          "- **Ransomwares** : Chiffrent les données contre rançon\n" +
          "- **Rootkits** : Cachent la présence de logiciels malveillants\n\n" +
          "**Méthodes d'analyse :**\n" +
          "1. **Analyse statique** : Sans exécution\n" +
          "   - Analyse des chaînes de caractères\n" +
          "   - Extraction des ressources\n" +
          "   - Désassemblage\n" +
          "2. **Analyse dynamique** : Avec exécution contrôlée\n" +
          "   - Analyse du comportement\n" +
          "   - Surveillance des appels système\n" +
          "   - Analyse réseau\n\n" +
          "**Outils d'analyse :**\n" +
          "- **Analyse statique** : IDA Pro, Ghidra, PEStudio\n" +
          "- **Analyse dynamique** : Cuckoo Sandbox, CAPE, Any.Run\n" +
          "- **Analyse mémoire** : Volatility, Rekall\n" +
          "- **Désobfuscation** : FLOSS, de4dot"
      },
      'détection': {
        pattern: ['détection', 'détecter', 'signature', 'comportement'],
        response: "🔍 **Techniques de Détection Avancée**\n\n" +
          "**1. Détection basée sur les signatures :**\n" +
          "- Utilisation de YARA pour les fichiers\n" +
          "- Signatures réseau (Snort, Suricata)\n" +
          "- Hashs de fichiers malveillants\n\n" +
          "**2. Détection basée sur le comportement :**\n" +
          "- Analyse des séquences d'appels système\n" +
          "- Détection des techniques MITRE ATT&CK\n" +
          "- Analyse des anomalies comportementales\n\n" +
          "**3. Détection basée sur le Machine Learning :**\n" +
          "- Classification des fichiers\n" +
          "- Détection d'anomalies\n" +
          "- Analyse heuristique\n\n" +
          "**4. Threat Hunting Proactif :**\n" +
          "- Recherche d'IoCs connus\n" +
          "- Détection des TTPs (Tactics, Techniques, Procedures)\n" +
          "- Analyse des logs avancée"
      }
    };

    for (const [key, value] of Object.entries(securityResponses)) {
      if (value.pattern.some(term => userInput.toLowerCase().includes(term))) {
        return value.response;  // Retourne uniquement la réponse texte
      }
    }
    return null;
  };

  const getGeneralResponse = (userInput) => {
    if (/bonjour|salut|coucou|hello|hi|hey/i.test(userInput)) {
      return "👋 Bonjour ! Je suis votre assistant en sécurité informatique. Je peux vous aider avec :\n\n" +
             "- Analyse des menaces et malwares\n" +
             "- Configuration de la sécurité\n" +
             "- Bonnes pratiques de cybersécurité\n" +
             "- Outils de sécurité (YARA, SIEM, EDR, etc.)\n\n" +
             "Comment puis-je vous aider aujourd'hui ?";
    } else if (userInput.includes('merci') || userInput.includes('remercie')) {
      return "Je vous en prie ! N'hésitez pas si vous avez d'autres questions sur la sécurité ou le Threat Hunting.";
    } else if (userInput.includes('aide') || userInput.includes('aider')) {
      return "🆘 **Aide - Domaines d'expertise**\n\n" +
             "Je peux vous aider avec :\n\n" +
             "**Sécurité des systèmes :**\n" +
             "- Détection des menaces\n" +
             "- Réponse aux incidents\n" +
             "- Analyse de malwares\n\n" +
             "**Outils :**\n" +
             "- YARA - Création de règles\n" +
             "- SIEM - Gestion des événements\n" +
             "- EDR - Protection des terminaux\n\n" +
             "**Bonnes pratiques :**\n" +
             "- Sécurisation des systèmes\n" +
             "- Gestion des vulnérabilités\n" +
             "- Conformité et réglementation\n\n" +
             "Posez-moi votre question directement !";
    }
    return null;
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Réinitialiser le champ de fichier s'il y en a un
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    const userInput = input.toLowerCase();
    
    // Vérifier d'abord les réponses de sécurité
    const securityResponse = getSecurityResponse(userInput);
    
    // Simuler un délai de réponse
    setTimeout(() => {
      if (securityResponse) {
        setMessages(prev => [
          ...prev, 
          {
            text: securityResponse,
            sender: 'assistant'
          }
        ]);
      } else {
        // Vérifier les réponses générales
        const generalResponse = getGeneralResponse(userInput);
        setMessages(prev => [
          ...prev,
          {
            text: generalResponse || `Je vais traiter votre demande concernant : "${input}"`,
            sender: 'assistant'
          }
        ]);
      }
    }, 500);
  };

  const renderMessageContent = (message) => {
    return (
      <>
        {message.text && <div>{message.text}</div>}
      </>
    );
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <FloatingButton onClick={toggleChat}>
        {isOpen ? '✕' : '💬'}
      </FloatingButton>
      <ChatContainer isOpen={isOpen}>
        <ChatHeader onClick={() => setIsOpen(!isOpen)}>
          <span>Assistant Sécurité</span>
          <span>{isOpen ? '−' : '+'}</span>
        </ChatHeader>
        
        {isOpen && (
          <>
            <ChatBody>
              {messages.map(message => (
                <Message key={message.text} isUser={message.sender === 'user'}>
                  {renderMessageContent(message)}
                </Message>
              ))}
              <div ref={messagesEndRef} />
            </ChatBody>
            
            <form onSubmit={handleSend}>
              <InputContainer>
                <FileInput
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <FileInputLabel htmlFor="file-upload">
                  📎 Image
                </FileInputLabel>
                
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tapez votre message..."
                />
                
                <SendButton type="submit">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </SendButton>
              </InputContainer>
            </form>
          </>
        )}
      </ChatContainer>
    </>
  );
};

export default Chatbot;
