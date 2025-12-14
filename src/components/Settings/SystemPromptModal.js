import React, { useState, useEffect } from "react";

const PRESET_PROMPTS = [
  {
    id: "default",
    name: "Default Assistant",
    description: "Helpful, concise, and friendly",
    prompt: null, // Uses default system prompt
  },
  {
    id: "coder",
    name: "Code Assistant",
    description: "Expert programmer, focuses on clean code",
    prompt: `You are an expert programmer and coding assistant. Focus on:
- Writing clean, efficient, and well-documented code
- Explaining technical concepts clearly
- Suggesting best practices and design patterns
- Helping debug issues systematically
- Providing code examples when helpful
Keep responses focused on code and technical solutions.`,
  },
  {
    id: "writer",
    name: "Writing Assistant",
    description: "Creative writer, helps with content",
    prompt: `You are a skilled writing assistant. Focus on:
- Helping craft clear, engaging prose
- Suggesting improvements to tone, flow, and structure
- Assisting with grammar and style
- Brainstorming ideas and outlines
- Adapting writing style to different contexts
Be creative and supportive while maintaining the user's voice.`,
  },
  {
    id: "tutor",
    name: "Learning Tutor",
    description: "Patient teacher, explains concepts",
    prompt: `You are a patient and encouraging tutor. Focus on:
- Explaining concepts step by step
- Using analogies and examples to clarify ideas
- Checking understanding before moving on
- Breaking complex topics into manageable parts
- Encouraging questions and curiosity
Adapt your explanations to the learner's level.`,
  },
  {
    id: "analyst",
    name: "Data Analyst",
    description: "Analytical thinker, data-focused",
    prompt: `You are a sharp data analyst. Focus on:
- Analyzing information objectively
- Identifying patterns and insights
- Presenting findings clearly with data
- Questioning assumptions
- Providing evidence-based recommendations
Be precise and thorough in your analysis.`,
  },
];

const SystemPromptModal = ({ isOpen, onClose, currentPrompt, onSave }) => {
  const [selectedPreset, setSelectedPreset] = useState("default");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Determine if current prompt matches a preset
      if (!currentPrompt) {
        setSelectedPreset("default");
        setIsCustom(false);
        setCustomPrompt("");
      } else {
        const matchingPreset = PRESET_PROMPTS.find(p => p.prompt === currentPrompt);
        if (matchingPreset) {
          setSelectedPreset(matchingPreset.id);
          setIsCustom(false);
          setCustomPrompt("");
        } else {
          setSelectedPreset("custom");
          setIsCustom(true);
          setCustomPrompt(currentPrompt);
        }
      }
    }
  }, [isOpen, currentPrompt]);

  const handlePresetChange = (presetId) => {
    if (presetId === "custom") {
      setIsCustom(true);
      setSelectedPreset("custom");
    } else {
      setIsCustom(false);
      setSelectedPreset(presetId);
      setCustomPrompt("");
    }
  };

  const handleSave = () => {
    if (isCustom) {
      onSave(customPrompt.trim() || null);
    } else {
      const preset = PRESET_PROMPTS.find(p => p.id === selectedPreset);
      onSave(preset?.prompt || null);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm no-drag"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-chat-surface border border-chat-border rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-chat-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">AI Personality</h2>
              <p className="text-xs text-gray-500">Customize how AI responds in this conversation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Preset options */}
          <div className="space-y-2">
            {PRESET_PROMPTS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedPreset === preset.id && !isCustom
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-chat-border hover:border-gray-600 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedPreset === preset.id && !isCustom
                      ? "border-purple-500"
                      : "border-gray-500"
                  }`}>
                    {selectedPreset === preset.id && !isCustom && (
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{preset.name}</div>
                    <div className="text-xs text-gray-500">{preset.description}</div>
                  </div>
                </div>
              </button>
            ))}

            {/* Custom option */}
            <button
              onClick={() => handlePresetChange("custom")}
              className={`w-full p-3 rounded-lg border text-left transition-all ${
                isCustom
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-chat-border hover:border-gray-600 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isCustom ? "border-purple-500" : "border-gray-500"
                }`}>
                  {isCustom && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Custom Prompt</div>
                  <div className="text-xs text-gray-500">Write your own system instructions</div>
                </div>
              </div>
            </button>
          </div>

          {/* Custom prompt textarea */}
          {isCustom && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Custom System Prompt
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe how you want the AI to behave..."
                rows={5}
                className="w-full px-4 py-3 bg-chat-bg border border-chat-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
              />
              <p className="text-xs text-gray-500">
                This will be prepended to all messages in this conversation.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-chat-border bg-chat-bg/50 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-chat-border text-gray-300 hover:bg-white/5 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemPromptModal;
