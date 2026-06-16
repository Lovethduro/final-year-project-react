import { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';
import { FONT_BODY, FONT_DISPLAY } from './styles/landingFonts';

function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! 👋 I'm CyForce AI Assistant. How can I help you today?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const groq = new Groq({
        apiKey: process.env.REACT_APP_GROQ_API_KEY,
        dangerouslyAllowBrowser: true,
    });

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
                text: "⚠️ The assistant is not configured yet. Please contact us at +234 (0) 901 066 9297 or info@cyforcetech.com.",
                sender: "bot"
            }]);
            setIsTyping(false);
            return;
        }

        try {
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
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2B5CE6, #38BDF8)",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(43,92,230,0.4)",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    transition: "transform 0.3s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
                💬
            </button>

            {isOpen && (
                <div style={{
                    position: "fixed",
                    bottom: "90px",
                    right: "20px",
                    width: "min(380px, calc(100vw - 40px))",
                    height: "550px",
                    background: "#0D1830",
                    borderRadius: "16px",
                    border: "0.5px solid rgba(56,189,248,0.3)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    fontFamily: FONT_BODY,
                }}>
                    <div style={{
                        padding: "18px",
                        background: "linear-gradient(135deg, #2B5CE6, #38BDF8)",
                        color: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "24px" }}>🤖</span>
                            <div>
                                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "16px" }}>CyForce AI Assistant</div>
                                <div style={{ fontSize: "11px", opacity: 0.85 }}>Powered by Groq</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            aria-label="Close chat"
                            onClick={() => setIsOpen(false)}
                            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "20px" }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{ flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                                <div style={{
                                    maxWidth: "80%",
                                    padding: "10px 14px",
                                    borderRadius: msg.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                    background: msg.sender === "user" ? "#2B5CE6" : "rgba(255,255,255,0.08)",
                                    color: "#fff",
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
                                    background: "rgba(255,255,255,0.08)",
                                    display: "flex",
                                    gap: "4px",
                                }}>
                                    <span style={{ animation: "bounce 1.4s infinite" }}>●</span>
                                    <span style={{ animation: "bounce 1.4s infinite 0.2s" }}>●</span>
                                    <span style={{ animation: "bounce 1.4s infinite 0.4s" }}>●</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ padding: "15px", borderTop: "0.5px solid rgba(99,179,237,0.1)", display: "flex", gap: "10px" }}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything..."
                            style={{
                                flex: 1,
                                padding: "12px",
                                borderRadius: "24px",
                                border: "0.5px solid rgba(99,179,237,0.3)",
                                background: "rgba(255,255,255,0.05)",
                                color: "#fff",
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
                                background: "#2B5CE6",
                                border: "none",
                                cursor: "pointer",
                                color: "#fff",
                                fontSize: "18px",
                            }}
                        >
                            ➤
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
