
import React, { useState, useEffect, useRef } from 'react';
import { Difficulty, ScenarioType, SimulationState, Message } from './types';
import { generateCustomerResponse, generatePerformanceFeedback } from './geminiService';
import ChatBubble from './components/ChatBubble';
import FeedbackDisplay from './components/FeedbackDisplay';

const App: React.FC = () => {
  // Setup State
  const [configFirstName, setConfigFirstName] = useState<string>('Alex');
  const [configLastName, setConfigLastName] = useState<string>('Rivera');
  const [configDifficulty, setConfigDifficulty] = useState<Difficulty>(Difficulty.MODERATE);
  const [configBalance, setConfigBalance] = useState<number>(450);
  const [configReason, setConfigReason] = useState<string>('Unpaid credit card statement from the holiday season');
  
  // Simulation State
  const [state, setState] = useState<SimulationState>({
    isActive: false,
    difficulty: Difficulty.MODERATE,
    scenario: '',
    balance: 0,
    customerName: '',
    messages: [],
    feedback: null,
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages]);

  const startSimulation = () => {
    const fullName = `${configFirstName} ${configLastName}`.trim() || 'Customer';

    setState({
      isActive: true,
      difficulty: configDifficulty,
      scenario: configReason,
      balance: configBalance,
      customerName: fullName,
      messages: [
        { role: 'model', text: `Hello? This is ${fullName} speaking. Who's calling and what is this about?` }
      ],
      feedback: null,
    });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: inputText };
    const updatedMessages = [...state.messages, userMessage];
    
    setState(prev => ({ ...prev, messages: updatedMessages }));
    setInputText('');
    setIsLoading(true);

    try {
      const response = await generateCustomerResponse(
        updatedMessages,
        state.difficulty,
        state.scenario,
        state.balance,
        state.customerName
      );

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'model', text: response }]
      }));
    } catch (error) {
      console.error("Simulation Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    setIsLoading(true);
    try {
      const feedback = await generatePerformanceFeedback(
        state.messages,
        state.difficulty,
        state.scenario,
        state.balance
      );
      setState(prev => ({ ...prev, isActive: false, feedback }));
    } catch (error) {
      console.error("Feedback Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSimulation = () => {
    setState({
      isActive: false,
      difficulty: Difficulty.MODERATE,
      scenario: '',
      balance: 0,
      customerName: '',
      messages: [],
      feedback: null,
    });
  };

  if (state.feedback) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <FeedbackDisplay feedback={state.feedback} onReset={resetSimulation} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-100 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">Debt Collector Pro</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">AI TRAINING SIMULATION v1.4</p>
          </div>
        </div>

        {state.isActive && (
          <button
            onClick={endSession}
            disabled={isLoading}
            className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-sm font-bold transition-colors border border-rose-100 uppercase tracking-tight"
          >
            End & Evaluate
          </button>
        )}
      </header>

      {!state.isActive ? (
        <main className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-slate-50">
          <div className="max-w-2xl w-full space-y-8 py-10">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Setup Your Trainee Scenario</h2>
              <p className="text-slate-500 text-lg">Define the target customer profile and debt specifics to begin the roleplay.</p>
            </div>
            
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-200/40 border border-slate-100 space-y-8">
              
              {/* Name Section */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Customer Identity</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">First Name</span>
                    <input
                      type="text"
                      value={configFirstName}
                      onChange={(e) => setConfigFirstName(e.target.value)}
                      placeholder="e.g. Michael"
                      className="w-full py-3 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-semibold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Last Name</span>
                    <input
                      type="text"
                      value={configLastName}
                      onChange={(e) => setConfigLastName(e.target.value)}
                      placeholder="e.g. Jenkins"
                      className="w-full py-3 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Behavior & Balance Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Difficulty */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Behavior Profile</label>
                  <div className="flex flex-col gap-2">
                    {Object.values(Difficulty).map((d) => (
                      <button
                        key={d}
                        onClick={() => setConfigDifficulty(d)}
                        className={`py-3 px-4 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-between ${
                          configDifficulty === d 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        {d}
                        {configDifficulty === d && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Balance */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Balance Due ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      value={configBalance}
                      onChange={(e) => setConfigBalance(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full py-3 pl-8 pr-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-bold text-xl text-slate-800"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Typical collection range: $50 - $5,000</p>
                </div>
              </div>

              {/* Reason Input */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Case Context / Debt Reason</label>
                <textarea
                  value={configReason}
                  onChange={(e) => setConfigReason(e.target.value)}
                  placeholder="Describe why this customer owes money (e.g. Unpaid medical bills, membership fees, etc.)"
                  rows={2}
                  className="w-full py-4 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all text-sm font-medium text-slate-800 resize-none"
                />
              </div>

              <button
                onClick={startSimulation}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg rounded-2xl transition-all shadow-xl shadow-indigo-200 transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Launch Simulation
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-72px)] overflow-hidden">
          {/* Dashboard Info Sidebar */}
          <aside className="w-full md:w-80 bg-white border-r border-slate-200 p-6 space-y-6 hidden md:block overflow-y-auto">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Live Case Dashboard</h3>
              <div className="space-y-1">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-3">
                   <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Customer</div>
                   <div className="text-lg font-bold text-slate-800">{state.customerName}</div>
                </div>
                
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 mb-3">
                   <div className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Debt Exposure</div>
                   <div className="text-xl font-black text-indigo-700">${state.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                   <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Difficulty</div>
                     <span className={`text-[10px] font-bold uppercase tracking-tight ${
                        state.difficulty === Difficulty.EASY ? 'text-emerald-600' :
                        state.difficulty === Difficulty.MODERATE ? 'text-amber-600' :
                        'text-rose-600'
                      }`}>
                        {state.difficulty}
                      </span>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Status</div>
                     <span className="text-[10px] text-indigo-600 font-bold uppercase">NEGOTIATING</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-900 rounded-3xl text-slate-200 shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                 <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                 <h4 className="text-xs font-bold uppercase tracking-wider">Roleplay Brief</h4>
              </div>
              <p className="text-[11px] leading-relaxed opacity-80">
                <span className="font-bold text-white">Scenario:</span> {state.scenario}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1 italic">Agent Guidance</p>
                <p className="text-[11px] opacity-60 leading-relaxed">
                  Focus on establishing rapport first. If behavior is '{state.difficulty}', be prepared for {state.difficulty === Difficulty.DIFFICULT ? 'resistance' : 'questions'}.
                </p>
              </div>
            </div>
          </aside>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col bg-slate-50 relative">
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4"
            >
              {state.messages.map((msg, idx) => (
                <ChatBubble 
                  key={idx} 
                  message={msg} 
                  customerName={state.customerName} 
                />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white border border-slate-100 px-5 py-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{state.customerName} is responding...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-8 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your collection pitch or response..."
                    className="w-full py-5 pl-7 pr-16 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all text-sm md:text-base font-medium shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </div>
              </form>
              <div className="max-w-4xl mx-auto mt-3 flex justify-center">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Training Mode: Professional Communication Active</p>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
