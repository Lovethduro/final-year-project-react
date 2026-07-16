import { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';
import { MessageCircle, Bot, X, Send } from 'lucide-react';
import { FONT_BODY, FONT_DISPLAY } from './styles/landingFonts';
import { theme } from './styles/theme';

function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm CyForce AI Assistant. How can I help you today?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { text: userMessage, sender: "user" }]);
        setInput("");
        setIsTyping(true);

        if (!process.env.REACT_APP_GROQ_API_KEY) {
            setMessages(prev => [...prev, {
                text: "The assistant is not configured yet. Please contact us at +234 (0) 901 066 9297 or info@cyforcetech.com.",
                sender: "bot"
            }]);
            setIsTyping(false);
            return;
        }

        try {
            const groq = new Groq({
                apiKey: process.env.REACT_APP_GROQ_API_KEY,
                dangerouslyAllowBrowser: true,
            });
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are CyForce AI Assistant for CyForce Technologies. 
            Answer questions about these services: Cyber Security, ICT Services, 
            Solar Energy, Automation, Enterprise Solutions (POS, ERP), and Certificate Management.
            Be helpful, professional, and concise. Keep responses under 150 words.
            Contact info: Phone +234 (0) 901 066 9297, Email info@cyforcetech.com.
            Address: Broadway Mall, No3 Yisa Braimoh Street, Kaura-District, Abuja-FCT.`
                    },
                    { role: "user", content: userMessage }
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0.7,
                max_tokens: 500,
            });

            const aiResponse = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
            setMessages(prev => [...prev, { text: aiResponse, sender: "bot" }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, {
                text: "Sorry, I'm having trouble connecting right now. Please try again later or contact us directly at +234 (0) 901 066 9297.",
                sender: "bot"
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <button
                type="button"
                aria-label="Open chat assistant"
                className="cyforce-ai-chat-fab"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed",
                    bottom: "24px",
                    left: "24px",
                    right: "auto",
                    height: "48px",
                    padding: "0 20px",
                    borderRadius: "24px",
                    background: theme.primary,
                    border: "1px solid rgba(255,255,255,0.2)",
                    cursor: "pointer",
                    boxShadow: "0 8px 28px rgba(0,45,114,0.35)",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    color: "#fff",
                    fontFamily: FONT_BODY,
                    fontWeight: 600,
                    fontSize: 14,
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,45,114,0.42)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,45,114,0.35)";
                }}
            >
                <MessageCircle size={18} strokeWidth={2} aria-hidden="true" />
                Chat Us!
            </button>

            {isOpen && (
                <div
                    className="cyforce-ai-chat-panel"
                    style={{
                    position: "fixed",
                    bottom: "90px",
                    left: "20px",
                    right: "auto",
                    width: "min(380px, calc(100vw - 40px))",
                    height: "550px",
                    background: "#FFFFFF",
                    borderRadius: "16px",
                    border: `0.5px solid ${theme.border}`,
                    boxShadow: "0 20px 60px rgba(0,45,114,0.18)",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    fontFamily: FONT_BODY,
                }}>
                    <div style={{
                        padding: "18px",
                        background: theme.primary,
                        color: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Bot size={24} strokeWidth={1.75} aria-hidden="true" />
                            <div>
                                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "16px" }}>CyForce AI Assistant</div>
                                <div style={{ fontSize: "11px", opacity: 0.85 }}>Here to help</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            aria-label="Close chat"
                            onClick={() => setIsOpen(false)}
                            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", padding: 4 }}
                        >
                            <X size={20} strokeWidth={2} aria-hidden="true" />
                        </button>
                    </div>

                    <div style={{ flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", background: theme.bgCard }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                                <div style={{
                                    maxWidth: "80%",
                                    padding: "10px 14px",
                                    borderRadius: msg.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                    background: msg.sender === "user" ? theme.primary : "#FFFFFF",
                                    color: msg.sender === "user" ? "#fff" : theme.text,
                                    border: msg.sender === "user" ? "none" : `1px solid ${theme.border}`,
                                    fontSize: "13px",
                                    lineHeight: "1.5",
                                    whiteSpace: "pre-line"
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                <div style={{
                                    padding: "10px 14px",
                                    borderRadius: "18px 18px 18px 4px",
                                    background: "#FFFFFF",
                                    border: `1px solid ${theme.border}`,
                                    display: "flex",
                                    gap: "4px",
                                    color: theme.textMuted,
                                }}>
                                    <span style={{ animation: "bounce 1.4s infinite" }}>●</span>
                                    <span style={{ animation: "bounce 1.4s infinite 0.2s" }}>●</span>
                                    <span style={{ animation: "bounce 1.4s infinite 0.4s" }}>●</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ padding: "15px", borderTop: `0.5px solid ${theme.border}`, display: "flex", gap: "10px", background: "#FFFFFF" }}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything..."
                            style={{
                                flex: 1,
                                padding: "12px",
                                borderRadius: "24px",
                                border: `0.5px solid ${theme.border}`,
                                background: theme.bgCard,
                                color: theme.text,
                                fontSize: "13px",
                                outline: "none",
                                fontFamily: FONT_BODY,
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleSend}
                            aria-label="Send message"
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: theme.primary,
                                border: "none",
                                cursor: "pointer",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Send size={16} strokeWidth={2} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-4px); }
                }
            `}</style>
        </>
    );
}

export default AIChatbot;
