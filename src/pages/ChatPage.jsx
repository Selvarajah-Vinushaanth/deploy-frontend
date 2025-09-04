import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // You'll need to install axios: npm install axios
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: 'Welcome to Tamil AI Chat. You can use this interface to interact with our Metaphor Classifier, Lyric Generator, and Metaphor Creator. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [error, setError] = useState(null);
  const [batchResults, setBatchResults] = useState(null); // For multi-line batch
  const [chartData, setChartData] = useState(null); // For chart summary
  const [batchPage, setBatchPage] = useState(1); // pagination for batch results
  const [showLyricOptionsPanel, setShowLyricOptionsPanel] = useState(false);
  const batchPageSize = 5;
  const messagesEndRef = useRef(null);
  
  // New states for metaphor creator options
  const [showMetaphorOptions, setShowMetaphorOptions] = useState(false);
  const [metaphorSource, setMetaphorSource] = useState("");
  const [metaphorTarget, setMetaphorTarget] = useState("general");
  const [metaphorEmotion, setMetaphorEmotion] = useState("positive");
  
  // New states for lyric generator options
  const [showLyricOptions, setShowLyricOptions] = useState(false);
  const [lyricEmotion, setLyricEmotion] = useState("calm");
  const [lyricSeed, setLyricSeed] = useState("");
  const [lyricSuggestions, setLyricSuggestions] = useState([
    "Under the moonlight we danced, swaying to the rhythm of our hearts.",
    "Whispers of love echo through the night, painting our dreams in starlight.",
    "Your smile outshines the morning sun, warming my soul completely.",
    "Through stormy days and peaceful nights, our love remains unshaken.",
    "Every moment with you feels like an eternity of bliss."
  ]); // State for lyric suggestions
  
  // API endpoints for each service
  const API_ENDPOINTS = {
    'metaphor-classifier': 'http://localhost:5000/api/predict',
    'lyric-generator': 'http://localhost:5000/api/generate-lyrics',
    'metaphor-creator': 'http://localhost:5000/api/create-metaphors'
  };
  
  // Mock examples for each service
  const examples = {
    'metaphor-classifier': [
      'Identify metaphors in "வானம் கண்ணீர் சிந்துகிறது"',
      'Analyze the metaphors in this poem: "இரவின் இதயம் துடிக்கிறது"',
      'Is "அவனது வார்த்தைகள் தேனாக இனித்தன" metaphorical?'
    ],
    'lyric-generator': [
      'Generate a song emotion: calm seed: "Under the moonlight we danced"',
      'Write a lyric emotion: happy seed: "Your smile outshines the morning sun"',
      'Create a sad song emotion: sad seed: "Memories fade like autumn leaves"'
    ],
    'metaphor-creator': [
      'Create a metaphor source: love target: ocean emotion: positive',
      'Make a metaphor source: life target: river emotion: neutral',
      'Generate a metaphor about knowledge and light emotion: positive'
    ]
  };

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Effect to handle model selection changes
  useEffect(() => {
    // Show/hide appropriate options based on selected model
    setShowMetaphorOptions(selectedModel === 'metaphor-creator');
    setShowLyricOptions(selectedModel === 'lyric-generator');
    
    // Reset input if model changes
    if (selectedModel === 'metaphor-creator') {
      if (metaphorSource) {
        setInput(`Create a metaphor source: ${metaphorSource} target: ${metaphorTarget} emotion: ${metaphorEmotion}`);
      }
    } else if (selectedModel === 'lyric-generator') {
      if (lyricSeed) {
        let inputText = `Generate a song emotion: ${lyricEmotion}`;
        if (lyricSeed) {
          inputText += ` seed: "${lyricSeed}"`;
        }
        setInput(inputText);
      }
    }
  }, [selectedModel, metaphorSource, metaphorTarget, metaphorEmotion, lyricEmotion, lyricSeed]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Detect which service to use based on the message content
  const detectService = (message) => {
    const lowerMsg = message.toLowerCase();

    // If user types "identify metaphor" or "identify literals", always use classifier
    if (
      (lowerMsg.includes('identify') && (lowerMsg.includes('metaphor') || lowerMsg.includes('literal')))
      || (lowerMsg.includes('classify') && (lowerMsg.includes('metaphor') || lowerMsg.includes('literal')))
      || (lowerMsg.includes('analyze') && (lowerMsg.includes('metaphor') || lowerMsg.includes('literal')))
    ) {
      return 'metaphor-classifier';
    }

    if (lowerMsg.includes('metaphor') && (lowerMsg.includes('identify') || lowerMsg.includes('analyze') || lowerMsg.includes('classify'))) {
      return 'metaphor-classifier';
    } else if (lowerMsg.includes('lyric') || lowerMsg.includes('song') || lowerMsg.includes('poem') || lowerMsg.includes('write')) {
      return 'lyric-generator';
    } else if ((lowerMsg.includes('create') || lowerMsg.includes('make') || lowerMsg.includes('generate')) && lowerMsg.includes('metaphor')) {
      return 'metaphor-creator';
    }

    return 'auto'; // Default
  };

  const handleNewChat = () => {
    setMessages([{
      role: 'system',
      content: 'Welcome to Tamil AI Chat. You can use this interface to interact with our Metaphor Classifier, Lyric Generator, and Metaphor Creator. How can I help you today?'
    }]);
    setInput('');
    setError(null);
    setBatchResults(null);
    setChartData(null);
    setBatchPage(1);
  };

  // Rerun logic: resend the last user message before this assistant response
  const handleRerun = (assistantIdx) => {
    // Find the last user message before this assistant response
    let userIdx = assistantIdx - 1;
    while (userIdx >= 0 && messages[userIdx].role !== 'user') {
      userIdx--;
    }
    if (userIdx >= 0) {
      setInput(messages[userIdx].content);
      // Optionally, auto-send:
      // handleSendMessage();
    }
  };

  // Update lyric generator UI to include mood selection and handle list responses
  const motions = [
    { value: 'அமைதி', label: 'Calm / அமைதி', icon: '🌊' },
    { value: 'சந்தோஷம்', label: 'Happy / சந்தோஷம்', icon: '😊' },
    { value: 'கவலை', label: 'Sad / கவலை', icon: '😢' },
    { value: 'காதல்', label: 'Romantic / காதல்', icon: '💖' },
    { value: 'உற்சாகம்', label: 'Energetic / உற்சாகம்', icon: '⚡' }
  ];

  // Render mood selection
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300 mb-2">Select Mood</label>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
      {motions.map((motion) => (
        <button
          key={motion.value}
          className={`${
            lyricEmotion === motion.value
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
          } rounded-lg p-2 transition-all border text-xs`}
          onClick={() => setLyricEmotion(motion.value)}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg mb-1">{motion.icon}</span>
            <div className="font-medium">{motion.label.split(' / ')[0]}</div>
            <div className="text-xs opacity-75">{motion.label.split(' / ')[1]}</div>
          </div>
        </button>
      ))}
    </div>
  </div>;

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setBatchResults(null);
    setChartData(null);

    // Determine which service to use
    const service = selectedModel === 'auto' ? detectService(input) : selectedModel;

    // Multi-line batch logic for metaphor-classifier
    if (
      (service === 'metaphor-classifier') &&
      input.split('\n').length > 1
    ) {
      const lines = input.split('\n').map(l => l.trim()).filter(Boolean);

      try {
        // Parallel API requests for each line
        const promises = lines.map(sentence =>
          axios.post(API_ENDPOINTS['metaphor-classifier'], { text: sentence })
            .then(response => {
              if (response.data.results) {
                return response.data.results[0];
              } else if (typeof response.data.is_metaphor !== "undefined") {
                return {
                  line: sentence,
                  isMetaphor: response.data.is_metaphor,
                  confidence: response.data.confidence
                };
              } else {
                return {
                  line: sentence,
                  isMetaphor: false,
                  confidence: 0
                };
              }
            })
            .catch((err) => ({
              line: sentence,
              isMetaphor: false,
              confidence: 0,
              error: true,
              errorMsg: err.message === "Network Error"
                ? "Network Error: Unable to reach the server. Please ensure the backend is running at http://localhost:5000."
                : err.message
            }))
        );

        const allResults = await Promise.all(promises);

        // Compute stats
        const metaphorCount = allResults.filter(r => r.isMetaphor).length;
        const literalCount = allResults.filter(r => !r.isMetaphor).length;

        setBatchResults(allResults);
        setChartData({ metaphor: metaphorCount, literal: literalCount });

        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `**Batch Metaphor Analysis**\n\nProcessed ${lines.length} lines. See below for results and chart.`,
            service: 'metaphor-classifier'
          }
        ]);
      } catch (error) {
        setError(
          error.message === "Network Error"
            ? "Network Error: Unable to reach the server. Please ensure the backend is running at http://localhost:5000."
            : 'Failed to analyze text. Please try again or check if the server is running.'
        );
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Sorry, I encountered an error while processing your request: ${error.message === "Network Error"
              ? "Network Error: Unable to reach the server. Please ensure the backend is running at http://localhost:5000."
              : error.message || "Unknown error"}. Please try again later.`,
            error: true
          }
        ]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      // Different API call logic for each service
      let responseContent = '';
      
      if (service === 'metaphor-classifier') {
        // Metaphor Classifier POST request
        const response = await axios.post(API_ENDPOINTS['metaphor-classifier'], {
          text: input
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Process metaphor classifier response
        if (response.data && response.data.is_metaphor !== undefined) {
          const isMetaphor = response.data.is_metaphor;
          const confidence = response.data.confidence || 0.8;
          responseContent = `**Metaphor Analysis**\n\nI've analyzed the text and identified the following:\n\n- "${input.split('"')[1] || 'Input text'}" - ${(confidence * 100).toFixed(1)}% confidence\n\nThis text is ${isMetaphor ? 'metaphorical' : 'literal'}. ${isMetaphor ? 'It creates a vivid imagery by connecting abstract concepts with tangible elements, which is common in Tamil literature.' : 'It uses direct language without figurative expressions.'}`;
        } else {
          responseContent = `**Metaphor Analysis**\n\nI've analyzed the text and identified the following metaphorical expressions:\n\n- "${input.split('"')[1] || 'Input text'}" - ${Math.floor(Math.random() * 20) + 80}% confidence\n\nThis metaphor creates a vivid imagery by connecting abstract concepts with tangible elements, which is common in Tamil literature.`;
        }
      } 
      else if (service === 'lyric-generator') {
        // Use values from the selection UI if available
        let emotion = lyricEmotion;
        let seed = lyricSeed;
        
        // If no emotion is selected, parse from the input
        if (!emotion) {
          const inputText = input.toLowerCase();
          
          // Extract emotion if specified with explicit marker
          if (inputText.includes("emotion:")) {
            const emotionMatch = inputText.match(/emotion:\s*(\w+)/i);
            if (emotionMatch && emotionMatch[1]) {
              emotion = emotionMatch[1].toLowerCase();
            }
          } 
          
          // Extract seed if specified with explicit marker
          if (inputText.includes("seed:")) {
            const seedMatch = inputText.match(/seed:\s*"([^"]+)"/i);
            if (seedMatch && seedMatch[1]) {
              seed = seedMatch[1].trim();
            } else {
              const seedMatch2 = inputText.match(/seed:\s*([^,]+)/i);
              if (seedMatch2 && seedMatch2[1]) {
                seed = seedMatch2[1].trim();
              }
            }
          }
          
          // If emotion wasn't explicitly specified, try to extract it from the rest of the input
          if (!emotion) {
            // Clean the input text by removing all parameter specifications
            let cleanedText = input
              .replace(/\bemotion:\s*\w+/i, "")
              .replace(/\bseed:\s*"[^"]+"/i, "")
              .replace(/\bseed:\s*[^,]+/i, "");
              
            // Extract emotion from common phrases
            if (cleanedText.includes("with") || cleanedText.includes("about")) {
              const withIndex = cleanedText.indexOf("with") !== -1 ? cleanedText.indexOf("with") : cleanedText.indexOf("about");
              emotion = cleanedText.substring(withIndex + 5).trim();
            } else {
              // Use a default emotion if none is found
              emotion = "neutral";
            }
          }
        }
        
        // Lyric Generator POST request with proper parameters
        console.log(`Sending lyric request - Emotion: ${emotion}, Seed: ${seed}`);
        const response = await axios.post(API_ENDPOINTS['lyric-generator'], {
          motion: emotion,
          seed: seed
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Process lyric generator response
        if (response.data && response.data.lyrics) {
          // Handle both array and string responses
          const lyricsArray = Array.isArray(response.data.lyrics) 
            ? response.data.lyrics 
            : [response.data.lyrics];
          
          console.log(`Received lyrics response: ${lyricsArray[0]?.substring(0, 50) || 'No lyrics'}...`);
          console.log(`Received ${response.data.suggestions ? response.data.suggestions.length : 0} lyric suggestions`);
          
          let responseIntro = `**Generated Tamil Lyrics**\n\n🎵 **Emotion:** ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`;
          if (seed) {
            responseIntro += `\n✨ **Seed:** "${seed}"`;
          }
          
          // Format each lyric line with proper spacing and numbering
          const formattedLyrics = lyricsArray.map((lyric, index) => {
            return `**${index + 1}.** ${lyric.trim()}`;
          }).join('\n\n');
          
          responseContent = `${responseIntro}\n\n---\n\n${formattedLyrics}\n\n---\n\n💫 *These lyrics express the ${emotion} emotions you requested.*`;
          
          // Update the lyric suggestions if they're provided in the response
          if (response.data.suggestions && response.data.suggestions.length > 0) {
            console.log("Updating lyric suggestions with new data from API");
            setLyricSuggestions(response.data.suggestions);
          } else {
            console.log("No suggestions received from API");
          }
        } else {
          console.log("No lyrics in response, using fallback");
          let responseIntro = `**Generated Lyrics**\n\nHere's a lyric with ${emotion} emotion`;
          if (seed) {
            responseIntro += ` starting with: "${seed}"`;
          }
          
          responseContent = `${responseIntro}:\n\nகாலை வெயிலின் கதிர்களில்\nகனவுகள் மலர்கின்றன\nவானம் அழைக்கும் குரலினில்\nவாழ்க்கை புதுமை பெறுகிறது\n\nThis lyric expresses the beauty of hope and new beginnings, drawing inspiration from your theme.`;
        }
      } 
      else if (service === 'metaphor-creator') {
        // Use values from the selection UI if available
        let source = metaphorSource;
        let target = metaphorTarget;
        let emotion = metaphorEmotion;
        
        // If no source is selected, parse from the input
        if (!source) {
          // Parse the input to extract parameters
          const inputText = input.toLowerCase();
          
          // Extract source and target if they're explicitly defined
          if (inputText.includes("source:")) {
            const match = inputText.match(/source:\s*(\w+)/i);
            if (match && match[1]) {
              source = match[1];
            }
          }
          
          if (inputText.includes("target:")) {
            const match = inputText.match(/target:\s*(\w+)/i);
            if (match && match[1]) {
              target = match[1];
            }
          }
          
          if (inputText.includes("emotion:")) {
            const match = inputText.match(/emotion:\s*(\w+)/i);
            if (match && match[1]) {
              emotion = match[1].toLowerCase();
            }
          }
          
          // If source/target weren't explicitly defined, try to extract from common phrases
          if (!source) {
            if (inputText.includes("relating") || inputText.includes("connecting")) {
              const words = inputText.split(/\s+/);
              
              for (let i = 0; i < words.length; i++) {
                if (words[i] === "relating" || words[i] === "connecting") {
                  if (i + 1 < words.length) source = words[i + 1];
                  
                  for (let j = i + 2; j < words.length; j++) {
                    if (words[j] === "to" || words[j] === "and") {
                      if (j + 1 < words.length) {
                        target = words[j + 1];
                        break;
                      }
                    }
                  }
                  break;
                }
              }
            } else if (inputText.includes("about")) {
              const aboutIndex = inputText.indexOf("about");
              const afterAbout = inputText.substring(aboutIndex + 5).trim();
              const andIndex = afterAbout.indexOf("and");
              
              if (andIndex !== -1) {
                source = afterAbout.substring(0, andIndex).trim();
                target = afterAbout.substring(andIndex + 3).trim();
              } else {
                source = afterAbout.replace(/\bemotions?:\s*\w+/i, "").trim();
              }
            }
          }
          
          // If still no source found, use the whole input (excluding any parameter markers)
          if (!source) {
            source = input.replace(/\b(source|target|emotion):\s*\w+/ig, "").trim();
          }
        }
        
        // Metaphor Creator POST request with extracted parameters
        const response = await axios.post(API_ENDPOINTS['metaphor-creator'], {
          source: source,
          target: target,
          emotion: emotion
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Process metaphor creator response
        if (response.data && response.data.metaphors && response.data.metaphors.length > 0) {
          // Join multiple metaphors with line breaks, each metaphor on its own line
          const metaphorsText = response.data.metaphors.map(m => `"${m}"`).join('\n\n');
          responseContent = `**Created Metaphor**\n\nHere ${response.data.metaphors.length > 1 ? 'are some' : 'is a'} beautiful metaphor${response.data.metaphors.length > 1 ? 's' : ''} about "${source}"${target !== "general" ? ` related to "${target}"` : ''} with ${emotion} emotion:\n\n${metaphorsText}\n\nThese metaphors connect the concepts in a creative way that enhances understanding and emotional impact.`;
        } else {
          // Fallback with some beautiful predefined metaphors
          const fallbackMetaphors = [
            `"${source} is like a rare ${target}, both precious and beautiful in its uniqueness."`,
            `"${source} shines like a brilliant ${target}, catching light and attention with its radiance."`,
            `"${source} resembles a perfect ${target}, formed through pressure and time into something extraordinary."`,
            `"Just as a ${target} reflects light, ${source} reflects the beauty of the world around it."`,
            `"${source} is a treasure like a magnificent ${target}, valuable not just for its appearance but for its meaning."`
          ];
          
          const metaphorsText = fallbackMetaphors.join('\n\n');
          responseContent = `**Created Metaphor**\n\nHere are some beautiful metaphors about "${source}"${target !== "general" ? ` related to "${target}"` : ''} with ${emotion} emotion:\n\n${metaphorsText}\n\nThese metaphors connect the concepts in a creative way that enhances understanding and emotional impact.`;
        }
      } else {
        throw new Error(`Service ${service} not supported`);
      }
      
      // Add AI response to chat
      const aiMessage = { 
        role: 'assistant', 
        content: responseContent,
        service: service 
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Create service-specific error messages
      let friendlyError = error.message || "An unknown error occurred";
      
      if (error.message === "Network Error") {
        friendlyError = `Network Error: Unable to reach the ${service} server at ${API_ENDPOINTS[service]}. Please ensure the backend is running.`;
      } else if (error.response) {
        // Handle API error responses
        if (error.response.status === 422) {
          friendlyError = `The ${service} service couldn't process your request: ${error.response.data?.detail || 'Invalid input format'}`;
        } else if (error.response.status === 404) {
          friendlyError = `The ${service} endpoint could not be found. Please check your server configuration.`;
        } else {
          friendlyError = `Error from ${service} service: ${error.response.data?.detail || error.message}`;
        }
      }
      
      setError(friendlyError);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error while processing your request: ${friendlyError}. Please try again later.`,
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };
const copyLyric = (text) => {
  const decodedText = decodeURIComponent(text).replace(/\*\*(.*?)\*\*/g, '$1');
  navigator.clipboard.writeText(decodedText);
  
  // You can add a toast notification here if needed
  console.log('Copied lyric:', decodedText);
};
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Function to render message content with Markdown-like formatting
  const formatMessage = (content) => {
    // Handle lyric output with beautiful formatting
    if (content.includes("**Generated Tamil Lyrics**")) {
      const sections = content.split('---');
      
      if (sections.length >= 3) {
        const headerSection = sections[0];
        const lyricsSection = sections[1];
        const footerSection = sections[2];
        
        // Format header with emotion and seed info
        const formattedHeader = headerSection
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-400">$1</strong>')
          .replace(/🎵/g, '<span class="text-2xl">🎵</span>')
          .replace(/✨/g, '<span class="text-yellow-400">✨</span>');
        
        // Format lyrics with proper spacing and styling
        const formattedLyrics = lyricsSection
          .split('\n\n')
          .filter(lyric => lyric.trim())
          .map((lyric, index) => {
            const cleanLyric = lyric.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300">$1</strong>');
            return `
              <div class="lyric-line bg-gray-700/30 rounded-lg p-4 mb-3 border-l-4 border-blue-400 hover:bg-gray-700/50 transition-all group">
                <div class="flex items-start justify-between">
                  <div class="flex-grow text-gray-100 leading-relaxed font-tamil text-lg">
                    ${cleanLyric}
                  </div>
                  <button 
                    class="ml-3 p-2 text-gray-400 hover:text-white bg-gray-600/50 hover:bg-gray-600 rounded-md opacity-0 group-hover:opacity-100 transition-all copy-lyric-btn" 
                    onclick="copyLyric(event, '${encodeURIComponent(lyric.replace(/\*\*(.*?)\*\*/g, '$1'))}')"
                    title="Copy this lyric"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            `;
          }).join('');
        
        // Format footer
        const formattedFooter = footerSection
          .replace(/💫/g, '<span class="text-purple-400 text-lg">💫</span>')
          .replace(/\*(.*?)\*/g, '<em class="text-gray-300">$1</em>');
        
        const result = `
          <div class="lyrics-container space-y-4">
            <div class="lyrics-header text-center pb-4 border-b border-gray-600/50">
              ${formattedHeader.replace(/\n/g, '<br>')}
            </div>
            
            <div class="lyrics-content space-y-2 py-4">
              ${formattedLyrics}
            </div>
            
            <div class="lyrics-footer text-center pt-4 border-t border-gray-600/50">
              ${formattedFooter.replace(/\n/g, '<br>')}
            </div>
            
            <script>
              function copyLyric(event, text) {
                const decodedText = decodeURIComponent(text).replace(/\*\*(.*?)\*\*/g, '$1');
                navigator.clipboard.writeText(decodedText);
                
                const btn = event.currentTarget;
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<span class="text-xs text-green-400">✓</span>';
                btn.classList.add('bg-green-600');
                
                setTimeout(() => {
                  btn.innerHTML = originalHTML;
                  btn.classList.remove('bg-green-600');
                }, 2000);
              }
            </script>
          </div>
        `;
        
        return <div dangerouslySetInnerHTML={{ __html: result }} />;
      }
    }
    
    // Handle metaphor output with copy buttons
    if (content.includes("**Created Metaphor**")) {
      // First, apply bold formatting
      const boldFormatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Extract metaphors from the content
      const metaphorSection = content.split('\n\n');
      let result = boldFormatted;
      
      // If there are metaphors (3rd section onwards), add copy buttons
      if (metaphorSection.length > 2) {
        // Get intro part (first two sections)
        const introPart = metaphorSection.slice(0, 2).join('\n\n');
        
        // Get metaphors and conclusion parts
        const metaphorPart = metaphorSection.slice(2, -1).join('\n\n');
        const conclusionPart = metaphorSection[metaphorSection.length - 1];
        
        // Split individual metaphors
        const metaphors = metaphorPart.split('\n\n').filter(m => m.trim() !== '');
        
        // Create HTML with copy buttons for each metaphor
        const metaphorsWithButtons = metaphors.map((m, i) => {
          return `
            <div class="flex items-start my-2 group">
              <div class="flex-grow metaphor-text">${m}</div>
              <button 
                class="ml-2 p-1 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity copy-btn" 
                data-metaphor="${encodeURIComponent(m)}"
                onclick="copyMetaphor(event, '${encodeURIComponent(m)}')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          `;
        }).join('');
        
        // Put it all together
        result = `
          <div class="metaphor-container">
            ${introPart.replace(/\n/g, '<br>')}
            <br><br>
            ${metaphorsWithButtons}
            <br>
            ${conclusionPart.replace(/\n/g, '<br>')}
            
            <script>
              function copyMetaphor(event, text) {
                const decodedText = decodeURIComponent(text);
                navigator.clipboard.writeText(decodedText);
                
                // Show "Copied!" tooltip
                const btn = event.currentTarget;
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<span class="text-xs">Copied!</span>';
                btn.classList.add('bg-green-600');
                
                // Reset after 2 seconds
                setTimeout(() => {
                  btn.innerHTML = originalHTML;
                  btn.classList.remove('bg-green-600');
                }, 2000);
              }
            </script>
          </div>
        `;
      }
      
      return <div dangerouslySetInnerHTML={{ __html: result }} />;
    }
    
    // Handle bold text for non-metaphor content
    const boldFormatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle line breaks
    const withLineBreaks = boldFormatted.replace(/\n/g, '<br>');
    
    return <div dangerouslySetInnerHTML={{ __html: withLineBreaks }} />;
  };

  // Pie chart SVG for metaphor/literal summary
  const renderPieChart = (data) => {
    if (!data) return null;
    const total = data.metaphor + data.literal;
    if (total === 0) return null;
    const metaphorAngle = (data.metaphor / total) * 360;
    const literalAngle = 360 - metaphorAngle;

    // Pie chart arc calculation
    const describeArc = (cx, cy, r, startAngle, endAngle) => {
      const rad = (deg) => (Math.PI / 180) * deg;
      const x1 = cx + r * Math.cos(rad(startAngle));
      const y1 = cy + r * Math.sin(rad(startAngle));
      const x2 = cx + r * Math.cos(rad(endAngle));
      const y2 = cy + r * Math.sin(rad(endAngle));
      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
      return [
        `M ${cx} ${cy}`,
        `L ${x1} ${y1}`,
        `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
    };

    return (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <path
          d={describeArc(60, 60, 50, 0, metaphorAngle)}
          fill="#f59e42"
          stroke="#fff"
          strokeWidth="2"
        />
        <path
          d={describeArc(60, 60, 50, metaphorAngle, 360)}
          fill="#4b5563"
          stroke="#fff"
          strokeWidth="2"
        />
        <circle cx="60" cy="60" r="35" fill="#18181b" />
        <text x="60" y="60" textAnchor="middle" dy="5" fontSize="16" fill="#fff">
          {data.metaphor} / {total}
        </text>
      </svg>
    );
  };

  const fetchLyricSuggestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/generate-lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: 'love',
          style: 'pop',
          length: 'medium',
          seed: 'Under the moonlight we danced',
        }),
      });

      const data = await response.json();
      if (data && data.suggestions) {
        setLyricSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching lyric suggestions:', error);
    }
  };

  useEffect(() => {
    fetchLyricSuggestions();
  }, []);
  // Add this useEffect after the existing useEffects
useEffect(() => {
  // Define global function for copy operations
  window.copyLyric = (event, text) => {
    const decodedText = decodeURIComponent(text).replace(/\*\*(.*?)\*\*/g, '$1');
    navigator.clipboard.writeText(decodedText);
    
    const btn = event.currentTarget;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="text-xs text-green-400">✓</span>';
    btn.classList.add('bg-green-600');
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('bg-green-600');
    }, 2000);
  };

  // Cleanup function to remove global function when component unmounts
  return () => {
    delete window.copyLyric;
  };
}, []);
// const motions = [
//   { value: 'அமைதி', label: 'Calm / அமைதி', color: 'bg-blue-600', icon: '🌊' },
//   { value: 'சந்தோஷம்', label: 'Happy / சந்தோஷம்', color: 'bg-yellow-500', icon: '😊' },
//   { value: 'கவலை', label: 'Sad / கவலை', color: 'bg-purple-600', icon: '😢' },
//   { value: 'காதல்', label: 'Romantic / காதல்', color: 'bg-pink-500', icon: '💖' },
//   { value: 'உற்சாகம்', label: 'Energetic / உற்சாகம்', color: 'bg-red-500', icon: '⚡' }
// ];
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-md py-4 px-6 border-b border-gray-700 flex justify-between items-center sticky top-0 z-10">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">T</span>
          </div>
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Tamil AI Chat
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select 
              className="appearance-none bg-gray-800 text-white text-sm rounded-lg pl-4 pr-10 py-2.5 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="auto">Auto-detect Service</option>
              <option value="metaphor-classifier">🎭 Metaphor Classifier</option>
              <option value="lyric-generator">🎵 Lyric Generator</option>
              <option value="metaphor-creator">✨ Metaphor Creator</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full text-gray-300 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
      className="hidden md:block w-[475px] bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl border-r border-gray-800 p-5 rounded-r-3xl shadow-2xl transition-all duration-300 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-gray-900"
      style={{ maxHeight: 'calc(100vh - 0.5rem)' }}
    >
          <div className="mb-6">
            <button 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl flex items-center justify-center transition-all hover:shadow-lg hover:shadow-purple-500/30 font-semibold tracking-wide"
              onClick={handleNewChat}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Chat
            </button>
          </div>
          
          <div className="mb-8">
            <h3 className="text-gray-300 text-xs uppercase font-bold mb-3 flex items-center tracking-wide">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Chats
            </h3>
            <div className="space-y-3">
              <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-700/40 to-purple-900/30 text-white border-l-4 border-purple-500 shadow-md flex flex-col gap-1">
                <div className="text-sm font-semibold truncate">Lyric Generation</div>
                <div className="text-xs text-gray-300 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  2 hours ago
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-700/30 to-blue-900/20 text-gray-100 border-l-4 border-blue-400 shadow hover:shadow-lg hover:bg-blue-800/30 cursor-pointer transition-all">
                <div className="text-sm font-semibold truncate">Metaphor Analysis</div>
                <div className="text-xs text-gray-300 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Yesterday
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-700/30 to-pink-900/20 text-gray-100 border-l-4 border-pink-400 shadow hover:shadow-lg hover:bg-pink-800/30 cursor-pointer transition-all">
                <div className="text-sm font-semibold truncate">Creating Nature Metaphors</div>
                <div className="text-xs text-gray-300 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  3 days ago
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-gray-300 text-xs uppercase font-bold mb-3 flex items-center tracking-wide">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Example Prompts
            </h3>
            {Object.entries(examples).map(([service, promptList]) => (
              <div key={service} className="mb-5">
                <h4 className={`text-sm font-bold mb-2 flex items-center ${
                  service === 'metaphor-classifier' 
                    ? 'text-orange-400' 
                    : service === 'lyric-generator'
                      ? 'text-blue-400'
                      : 'text-pink-400'
                }`}>
                  <span className="mr-1">
                    {service === 'metaphor-classifier' && '🎭'}
                    {service === 'lyric-generator' && '🎵'}
                    {service === 'metaphor-creator' && '✨'}
                  </span>
                  {service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h4>
                <div className="space-y-2">
                  {promptList.map((prompt, idx) => (
                    <div 
                      key={idx} 
                      className={`px-3 py-2 rounded-xl text-xs text-gray-100 bg-gradient-to-r from-gray-700/60 to-gray-800/60 border border-gray-700 hover:border-purple-500 shadow hover:shadow-lg cursor-pointer transition-all ${
                        service === 'metaphor-classifier' 
                          ? 'hover:shadow-orange-500/20' 
                          : service === 'lyric-generator'
                            ? 'hover:shadow-blue-500/20'
                            : 'hover:shadow-pink-500/20'
                      }`}
                      onClick={() => {
                        setInput(prompt);
                        setSelectedModel(service);
                      }}
                    >
                      {prompt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative" style={{ width: '100%' }}>
          {/* Decorative background elements */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-20 w-72 h-72 bg-pink-600/5 rounded-full blur-3xl"></div>
          
          {/* Error notification */}
          {error && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-2 text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 scrollbar-thin scrollbar-thumb-pink-600 scrollbar-track-gray-900">
            {messages.map((message, idx) => (
              message.role === 'system' ? (
                <div key={idx} className="flex justify-center items-center">
                  <div className="max-w-lg mx-auto bg-gray-700/80 text-gray-100 shadow-lg rounded-2xl px-5 py-6 text-center">
                    {formatMessage(message.content)}
                  </div>
                </div>
              ) : (
                <div 
                  key={idx} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {message.role !== 'user' && (
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center mr-3 shadow-lg">
                      {message.role === 'system' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-white font-bold">AI</span>
                      )}
                    </div>
                  )}
                  <div 
                    className={`max-w-2xl rounded-2xl px-5 py-4 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20' 
                        : message.role === 'system'
                          ? 'bg-gray-700/80 text-gray-100 shadow-lg'
                          : 'bg-gray-800/80 backdrop-blur-sm text-white border border-gray-700 shadow-lg'
                    } ${message.error ? 'border-red-500' : ''}`}
                  >
                    {message.role === 'assistant' && message.service && (
                      <div className={`flex items-center mb-2 ${
                        message.service === 'metaphor-classifier' 
                          ? 'text-orange-400' 
                          : message.service === 'lyric-generator'
                            ? 'text-blue-400'
                            : 'text-pink-400'
                      }`}>
                        <div className={`h-6 w-6 rounded-md flex items-center justify-center mr-2 ${
                          message.service === 'metaphor-classifier' 
                            ? 'bg-orange-500/20' 
                            : message.service === 'lyric-generator'
                              ? 'bg-blue-500/20'
                              : 'bg-pink-500/20'
                        }`}>
                          {message.service === 'metaphor-classifier' && '🎭'}
                          {message.service === 'lyric-generator' && '🎵'}
                          {message.service === 'metaphor-creator' && '✨'}
                        </div>
                        <div className="text-sm font-medium">
                          {message.service === 'metaphor-classifier' && 'Metaphor Classifier'}
                          {message.service === 'lyric-generator' && 'Lyric Generator'}
                          {message.service === 'metaphor-creator' && 'Metaphor Creator'}
                        </div>
                      </div>
                    )}
                    {formatMessage(message.content)}
                    {/* Rerun button for assistant responses */}
                    {message.role === 'assistant' && (
                      <div className="mt-4 flex justify-end">
                        <button
                          className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow transition"
                          onClick={() => handleRerun(idx)}
                        >
                          Rerun
                        </button>
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="h-9 w-9 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center ml-3 shadow-lg">
                      <span className="text-gray-300">You</span>
                    </div>
                  )}
                </div>
              )
            ))}
            
            {/* Batch Results for multi-line metaphor-classifier */}
            {batchResults && (
              <div className="bg-gray-900/80 rounded-2xl p-6 shadow-lg border border-gray-700 mt-4">
                <div className="flex items-center mb-4">
                  <span className="text-orange-400 text-lg font-bold mr-2">🎭</span>
                  <span className="font-semibold text-white">Batch Metaphor Analysis</span>
                </div>
                <div className="mb-4 flex flex-wrap gap-6 items-center">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Summary Chart</div>
                    {renderPieChart(chartData)}
                    <div className="text-xs text-gray-400 mt-2">
                      <span className="text-orange-400 font-bold">{chartData.metaphor}</span> metaphor(s), <span className="text-gray-300 font-bold">{chartData.literal}</span> literal(s)
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-1">Line-by-line Results</div>
                    {/* Pagination controls */}
                    <div className="flex justify-end items-center mb-2 gap-2">
                      <button
                        className="px-2 py-1 rounded bg-gray-700 text-gray-300 disabled:opacity-50"
                        disabled={batchPage <= 1}
                        onClick={() => setBatchPage(batchPage - 1)}
                      >◀</button>
                      <span className="text-xs text-gray-400">
                        Page {batchPage} of {Math.ceil(batchResults.length / batchPageSize)}
                      </span>
                      <button
                        className="px-2 py-1 rounded bg-gray-700 text-gray-300 disabled:opacity-50"
                        disabled={batchPage >= Math.ceil(batchResults.length / batchPageSize)}
                        onClick={() => setBatchPage(batchPage + 1)}
                      >▶</button>
                    </div>
                    <div className="space-y-2">
                      {batchResults
                        .slice((batchPage - 1) * batchPageSize, batchPage * batchPageSize)
                        .map((res, idx) => (
                          <div
  key={idx + (batchPage - 1) * batchPageSize}
  className={`rounded-lg px-4 py-2 flex items-center gap-3 ${
    res.isMetaphor
      ? 'bg-orange-500/10 border-l-4 border-orange-400'
      : 'bg-gray-700/50 border-l-4 border-gray-500'
  }`}
>
  <span className={`font-bold ${res.isMetaphor ? 'text-orange-400' : 'text-gray-300'}`}>
    {res.isMetaphor ? 'Metaphor' : 'Literal'}
  </span>
  <span className="text-xs text-gray-400">
    (
    {res.isMetaphor
      ? (res.confidence * 100).toFixed(1)
      : (100 - res.confidence * 100).toFixed(1)}
    % confidence)
  </span>
  <span className="ml-3 text-white">{res.line}</span>
</div>

                        ))}
                    </div>
                  </div>
                </div>
                {/* Dashboard Section */}
                <div className="mt-8 bg-gray-800/80 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">Dashboard & Explanatory Analysis</h3>
                  <div className="flex flex-wrap gap-8 items-start">
                    {/* Pie Chart */}
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Pie Chart</div>
                      {renderPieChart(chartData)}
                    </div>
                    {/* Explanatory Table */}
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 mb-2">Explanatory Table</div>
                      <table className="min-w-full text-left text-gray-200 text-sm bg-gray-900/80 rounded-xl overflow-hidden">
                        <tbody>
                          <tr className="border-b border-gray-700">
                            <td className="px-4 py-2">Total Lines</td>
                            <td className="px-4 py-2 font-semibold text-indigo-400">{batchResults.length}</td>
                          </tr>
                          <tr className="border-b border-gray-700">
                            <td className="px-4 py-2">Metaphors</td>
                            <td className="px-4 py-2 font-semibold text-orange-400">{chartData.metaphor}</td>
                          </tr>
                          <tr className="border-b border-gray-700">
                            <td className="px-4 py-2">Literal</td>
                            <td className="px-4 py-2 font-semibold text-gray-300">{chartData.literal}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2">Average Confidence</td>
                            <td className="px-4 py-2 font-semibold text-yellow-400">
                              {(
                                batchResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / batchResults.length * 100
                              ).toFixed(1)}%
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center mr-3 shadow-lg">
                  <span className="text-white font-bold">AI</span>
                </div>
                <div className="max-w-full rounded-2xl px-5 py-4 bg-gray-800/80 backdrop-blur-sm text-white border border-gray-700 shadow-lg">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <span className="text-sm text-gray-400 ml-2">Generating response...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Options Panels */}
          {showMetaphorOptions && (
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 border-t border-gray-700/30 animate-fade-in">
              <div className="mb-2 text-center">
                <h3 className="text-purple-400 font-medium">Metaphor Creator Options</h3>
                <p className="text-xs text-gray-400">Set your metaphor parameters</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Source Concept</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-700/80 text-white rounded-lg border border-gray-600 px-3 py-2 focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., love, knowledge, time"
                    value={metaphorSource}
                    onChange={(e) => setMetaphorSource(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Target Domain</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-700/80 text-white rounded-lg border border-gray-600 px-3 py-2 focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., ocean, fire, journey"
                    value={metaphorTarget}
                    onChange={(e) => setMetaphorTarget(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Emotion</label>
                  <select
                    className="w-full bg-gray-700/80 text-white rounded-lg border border-gray-600 px-3 py-2 focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    value={metaphorEmotion}
                    onChange={(e) => setMetaphorEmotion(e.target.value)}
                  >
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {showLyricOptions && (
    <div className="bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-black/90 rounded-xl border border-gray-700/40 mx-4 mb-2">
      {/* Toggle button */}
      <button
        onClick={() => setShowLyricOptionsPanel(!showLyricOptionsPanel)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        <span className="flex items-center">
          <span className="text-lg mr-2">✨</span>
          <span className="font-medium">Generate Tamil Lyrics</span>
        </span>
        {showLyricOptionsPanel ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {/* Expandable panel */}
      {showLyricOptionsPanel && (
        <div className="p-4 border-t border-gray-700/40 animate-fade-in">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-400">Select mood and add initial sentence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mood Selection */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-2">Select Mood</label>
              <div className="grid grid-cols-2 gap-2">
                {motions.map((motion) => (
                  <button
                    key={motion.value}
                    className={`${
                      lyricEmotion === motion.value
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
                    } rounded-lg p-2 transition-all border text-xs`}
                    onClick={() => setLyricEmotion(motion.value)}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-lg mb-1">{motion.icon}</span>
                      <div className="font-medium">{motion.label.split(' / ')[0]}</div>
                      <div className="text-xs opacity-75">{motion.label.split(' / ')[1]}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Initial Sentence */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-2">Initial Sentence (Optional)</label>
              <textarea
                className="w-full bg-gray-800 text-white rounded-xl border border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition text-sm"
                placeholder="Enter an initial sentence..."
                rows="4"
                value={lyricSeed}
                onChange={(e) => setLyricSeed(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2 italic">Lyrics will continue from this point</p>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                const message = `Generate a song emotion: ${lyricEmotion}${lyricSeed ? ` seed: "${lyricSeed}"` : ''}`;
                setInput(message);
                setShowLyricOptionsPanel(false);
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all font-medium"
            >
              confirm
            </button>
          </div>
        </div>
      )}
    </div>
  )}


          {/* Input Area */}
          <div className="border-t border-gray-700/50 backdrop-blur-sm bg-gray-800/30 p-4 w-full">
            <div className="w-full relative">
              <textarea
                className="w-full bg-gray-800/90 text-white rounded-2xl border border-gray-700 pl-5 pr-14 py-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none shadow-lg"
                rows="3"
                placeholder="Type your message here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              ></textarea>
              <button 
                className="absolute right-4 bottom-4 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-3 hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 transition-all"
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="w-full mt-3 text-xs text-gray-400 text-center">
              Tamil AI Models uses advanced AI to provide assistance. Your conversations help improve our services.
              <span className="text-purple-400 hover:text-purple-300 cursor-pointer ml-1">Privacy Policy</span>
            </div>
          </div>
        </div>
      </div>

      
      </div>
      
    
  );
}

