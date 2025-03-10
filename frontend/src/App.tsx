import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import CodeBlock from './components/CodeBlock';
import { RefreshCw, Download, Send, Key } from 'lucide-react';
import { getStoredApiKey, storeApiKey, removeApiKey } from './services/apiKey';
import APIKeyModal from './components/APIKeyModal';
import PDFPreview from './components/PDFPreview';
import Logo from './components/Logo';
import { generatePDFContent, type GeminiResponse, type ChatMessage } from './services/gemini';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { transform } from '@babel/standalone';

// Default resume template stays the same...
const defaultTemplate = `
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  section: {
    marginBottom: 1,
  },
  header: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 11,
    marginBottom: 5,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 3,
    marginTop: 5,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
    textTransform: 'uppercase',
    marginLeft: 10,
    marginRight: 10,
    paddingBottom: 2,
    textAlign: 'left',
  },
  experienceTitle: {
    fontSize: 12,
    marginBottom: 3,
    fontWeight: 'bold',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 10,
    marginRight: 10,
  },
  experienceCompanyName: {
    // Style for company name if needed
  },
  experienceDate: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  experienceDetails: {
    fontSize: 11,
    marginBottom: 3,
    color: '#666',
  },
  bulletPoint: {
    fontSize: 11,
    marginBottom: 3,
    marginLeft: 15,
    lineHeight: 1.3,
    maxWidth: 500,
  }
});

const ResumeDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.section}>
        <Text style={styles.header}>JOHN DOE</Text>
        <Text style={styles.subHeader}>Software Engineer</Text>
        <Text style={styles.subHeader}>contact@email.com</Text>
      </View>

      {/* Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUMMARY</Text>
        <Text style={styles.bulletPoint}>
          Experienced software engineer with expertise in web development
        </Text>
      </View>

      {/* Experience Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EXPERIENCE</Text>
        <View style={{ marginBottom: 10 }}>
          <View style={styles.experienceTitle}>
            <Text>Software Engineer, Tech Company</Text> <Text style={styles.experienceDate}>01/2020 - Present</Text>
          </View>
          <Text style={styles.bulletPoint}>• Spearheaded development of payment gateway integration for e-commerce platform, leading team of 5 developers and reducing transaction processing time by 35%</Text>
          <Text style={styles.bulletPoint}>• Architected and implemented microservices migration strategy for legacy monolithic application, resulting in 60% improved deployment frequency and 45% reduction in system downtime</Text>
        </View>
      </View>

      {/* Skills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SKILLS</Text>
        <Text style={styles.bulletPoint}>• JavaScript, React, Node.js</Text>
        <Text style={styles.bulletPoint}>• Python, TypeScript</Text>
      </View>

      {/* Education Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EDUCATION</Text>
        <View style={{ marginBottom: 10 }}>
          <View style={styles.experienceTitle}>
            <Text>Bachelor of Science in Computer Science, University Name</Text>
            <Text style={styles.experienceDate}>09/2015 - 05/2019</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default ResumeDocument;
`;

export default function App() {
  const [pdfContent, setPdfContent] = useState(defaultTemplate);
  const [userPrompt, setUserPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [pdfKey, setPdfKey] = useState(0);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isFirstRequest, setIsFirstRequest] = useState(true);
  const [apiKeyExists, setApiKeyExists] = useState(!!getStoredApiKey());

  // Auto-scroll to latest message
  useEffect(() => {
    const container = document.getElementById('chat-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setInterval(() => {
        setCooldownSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownSeconds]);

  const handlePromptSubmit = useCallback(async () => {
    if (!userPrompt.trim()) return;

    // Check for API key before proceeding
    if (!getStoredApiKey()) {
      setIsFirstRequest(true);
      setIsApiKeyModalOpen(true);
      return;
    }

    const newMessage: ChatMessage = {
      role: "user",
      parts: [{ text: userPrompt }]
    };

    // Immediately add user message to UI
    setMessages(prev => [...prev, newMessage]);
    
    setLoading(true);
    try {
      const response = await generatePDFContent(messages, newMessage);
      
      // Add model response to existing history
      setMessages(prev => [...prev, response.modelResponse]);
      
      if (response.reactCode) {
        setPdfContent(response.reactCode);
        setPdfKey(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error:', error);
      
      // Show error in UI without adding to chat history
      const frontendOnlyMessages = [...messages];
      
      if (error.name === 'RateLimitError') {
        setCooldownSeconds(60);
        frontendOnlyMessages.push({
          role: "model",
          parts: [{ text: `Rate limit reached. Please wait ${60} seconds before trying again.` }]
        });
      } else {
        frontendOnlyMessages.push({
          role: "model",
          parts: [{ text: 'Failed to update resume. Please try again.' }]
        });
      }
      
      setMessages(frontendOnlyMessages);
    } finally {
      setLoading(false);
    }
  }, [userPrompt, messages]);

  const handleMessageSend = useCallback(() => {
    if (!userPrompt.trim() || loading || cooldownSeconds) return;
    handlePromptSubmit();
    setUserPrompt(''); // Clear immediately
  }, [userPrompt, loading, cooldownSeconds, handlePromptSubmit]);

  const handleRefresh = useCallback(() => {
    setPdfKey(prev => prev + 1);
  }, []);

  const handleDownload = useCallback(async () => {
    try {
      const result = transform(pdfContent, {
        presets: ['react'],
        filename: 'resume.tsx',
      });

      if (!result.code) {
        throw new Error('Failed to transform code');
      }

      const componentCode = result.code.replace(/import.*?;/g, '').replace(/export default.*?;/, '');
      
      const createComponent = new Function(
        'React', 
        'Document', 
        'Page', 
        'Text', 
        'View', 
        'StyleSheet',
        `${componentCode} return ResumeDocument;`
      );

      const ResumeComponent = createComponent(React, Document, Page, Text, View, StyleSheet);
      const blob = await pdf(<ResumeComponent />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'resume.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Show PDF error in UI without adding to chat history
      const frontendOnlyMessages = [...messages];
      frontendOnlyMessages.push({
        role: "model",
        parts: [{ text: 'Error downloading PDF. Please try again.' }]
      });
      setMessages(frontendOnlyMessages);
    }
  }, [pdfContent]);

  const memoizedPDFPreview = useMemo(() => (
    <PDFPreview key={pdfKey} content={pdfContent} />
  ), [pdfContent, pdfKey]);

  return (
    <div className="h-screen bg-[var(--background)] bg-gradient-to-br from-slate-900 to-slate-800 flex text-[var(--text)] overflow-hidden p-4 gap-4">
      {/* Left Panel - Chat */}
      <div className="w-1/3 h-full glass-card rounded-2xl p-4 flex flex-col panel-transition overflow-hidden">
        <Logo />
        <div className="flex-grow mb-4 custom-scrollbar chat-container" id="chat-container">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-none md:max-w-[80%] rounded-xl p-4 message-bubble ${
                    message.role === 'user'
                      ? 'border-2 border-[var(--primary)] text-[var(--text)]'
                      : 'border border-[var(--border)]'
                  }`}
                >
                  <div className="text-sm prose prose-invert">
                    <ReactMarkdown
                      components={{
                        code: ({ className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !match;
                          
                          if (isInline) {
                            return <code className={className} {...props}>{children}</code>;
                          }

                          return (
                            <CodeBlock className={className}>
                              {String(children).replace(/\n$/, '')}
                            </CodeBlock>
                          );
                        },
                      }}
                    >
                      {message.parts[0].text}
                    </ReactMarkdown>
                  </div>
                  {message.role === 'model' && cooldownSeconds > 0 && (
                    <p className="text-sm text-blue-400 mt-2">
                      Cooldown: {cooldownSeconds} seconds remaining
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="w-full relative bg-[var(--background)] border border-[var(--border)] rounded-lg">
            <textarea
              className="w-full px-3 pt-2 pb-3 border-none outline-none rounded-lg min-h-[40px] max-h-[100px] resize-none bg-transparent text-[var(--text)] custom-scrollbar"
              placeholder="Tell me about yourself..."
              value={userPrompt}
              onChange={(e) => {
                setUserPrompt(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleMessageSend();
                }
              }}
            />
            <div className="absolute right-2 bottom-2">
              <button
                className={`send-button rounded-lg disabled:opacity-50 ${loading ? 'loading' : ''}`}
                onClick={handleMessageSend}
                disabled={loading || !userPrompt.trim() || cooldownSeconds > 0}
              >
                <Send />
                <div className="circular-progress" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - PDF Preview */}
      <div className="w-2/3 h-full flex flex-col overflow-hidden">
        <div className="flex justify-end gap-3 mb-4 mr-4">
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-xl flex items-center gap-2 button-hover text-[var(--text)]"
              onClick={() => setIsApiKeyModalOpen(true)}
            >
              <Key size={16} />
              <span className="font-medium">API Key</span>
            </button>
            <button
              className="px-4 py-2 rounded-xl flex items-center gap-2 button-hover text-[var(--text)]"
              onClick={handleRefresh}
            >
              <RefreshCw size={16} />
              <span className="font-medium">Refresh</span>
            </button>
            <button
              className="px-4 py-2 rounded-xl flex items-center gap-2 button-hover text-[var(--text)]"
              onClick={handleDownload}
              disabled={!pdfContent}
            >
              <Download size={16} />
              <span className="font-medium">Download PDF</span>
            </button>
          </div>
        </div>
        <div className="flex-grow glass-card rounded-2xl shadow-lg panel-transition scale-in custom-scrollbar">
          {memoizedPDFPreview}
        </div>

        <APIKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => {
            setIsApiKeyModalOpen(false);
            setIsFirstRequest(false);
          }}
          onSave={(apiKey) => {
            storeApiKey(apiKey);
            setApiKeyExists(true);
            if (isFirstRequest && userPrompt) {
              handlePromptSubmit();
            }
          }}
          onDelete={() => {
            removeApiKey();
            setApiKeyExists(false);
          }}
          existingKey={apiKeyExists}
          isFirstRequest={isFirstRequest}
        />
      </div>
    </div>
  );
}
