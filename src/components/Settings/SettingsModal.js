import React, { useState, useEffect } from "react";

const SettingsModal = ({ isOpen, onClose }) => {
  const [providers, setProviders] = useState({});
  const [activeProvider, setActiveProvider] = useState("gemini");
  const [selectedModel, setSelectedModel] = useState("");
  const [apiKeys, setApiKeys] = useState({});
  const [showKeys, setShowKeys] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [expandedProvider, setExpandedProvider] = useState(null);

  // Load settings on mount
  useEffect(() => {
    if (isOpen && window.electronAPI?.getProviders) {
      Promise.all([
        window.electronAPI.getProviders(),
        window.electronAPI.getProviderSettings(),
      ]).then(([providersData, settings]) => {
        setProviders(providersData);
        setActiveProvider(settings.activeProvider);
        setSelectedModel(settings.selectedModel);
        // Load actual API keys for each provider
        loadApiKeys(providersData);
      }).catch(err => {
        console.error("Failed to load settings:", err);
      });
    }
  }, [isOpen]);

  const loadApiKeys = async (providersData) => {
    const keys = {};
    for (const providerId of Object.keys(providersData)) {
      try {
        const key = await window.electronAPI.getProviderApiKey(providerId);
        keys[providerId] = key || "";
      } catch (e) {
        keys[providerId] = "";
      }
    }
    setApiKeys(keys);
  };

  const handleProviderChange = async (providerId) => {
    setActiveProvider(providerId);
    const provider = providers[providerId];
    if (provider) {
      setSelectedModel(provider.defaultModel);
    }
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
  };

  const handleApiKeyChange = (providerId, value) => {
    setApiKeys(prev => ({ ...prev, [providerId]: value }));
  };

  const toggleShowKey = (providerId) => {
    setShowKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const handleSave = async () => {
    // Check if active provider has an API key
    if (!apiKeys[activeProvider]?.trim()) {
      setMessage({ type: "error", text: `Please enter an API key for ${providers[activeProvider]?.name || activeProvider}` });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      if (window.electronAPI?.setProvider) {
        // Save provider selection
        await window.electronAPI.setProvider(activeProvider);

        // Save model selection
        await window.electronAPI.setModel(selectedModel);

        // Save all API keys that have values
        for (const [providerId, key] of Object.entries(apiKeys)) {
          if (key?.trim()) {
            await window.electronAPI.setProviderApiKey(providerId, key.trim());
          }
        }

        setMessage({ type: "success", text: "Settings saved successfully!" });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Fallback for browser testing
        localStorage.setItem("gabay_provider", activeProvider);
        localStorage.setItem("gabay_model", selectedModel);
        localStorage.setItem("gabay_api_keys", JSON.stringify(apiKeys));
        setMessage({ type: "success", text: "Settings saved!" });
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const openApiKeyLink = (url) => {
    window.electronAPI?.openExternal?.(url) || window.open(url, "_blank");
  };

  if (!isOpen) return null;

  const currentProvider = providers[activeProvider];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm no-drag"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-chat-surface border border-chat-border rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-chat-border shrink-0">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
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
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* AI Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              AI Provider
            </label>
            <select
              value={activeProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full px-4 py-3 bg-chat-bg border border-chat-border rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              {Object.entries(providers).map(([id, config]) => (
                <option key={id} value={id}>
                  {config.name} {apiKeys[id] ? "" : "(No API Key)"}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selection */}
          {currentProvider && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-4 py-3 bg-chat-bg border border-chat-border rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
              >
                {currentProvider.models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-chat-border pt-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">API Keys</h3>
          </div>

          {/* API Keys for each provider */}
          <div className="space-y-3">
            {Object.entries(providers).map(([id, config]) => (
              <div key={id} className="border border-chat-border rounded-lg overflow-hidden">
                {/* Provider header - clickable */}
                <button
                  onClick={() => setExpandedProvider(expandedProvider === id ? null : id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-chat-bg/50 hover:bg-chat-bg transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{config.name}</span>
                    {apiKeys[id] ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                        Configured
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
                        Not Set
                      </span>
                    )}
                    {id === activeProvider && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Active
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedProvider === id ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded content */}
                {expandedProvider === id && (
                  <div className="px-4 py-3 border-t border-chat-border bg-chat-bg/30">
                    <div className="relative">
                      <input
                        type={showKeys[id] ? "text" : "password"}
                        value={apiKeys[id] || ""}
                        onChange={(e) => handleApiKeyChange(id, e.target.value)}
                        placeholder={`Enter your ${config.name} API key`}
                        className="w-full px-4 py-3 pr-12 bg-chat-bg border border-chat-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey(id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showKeys[id] ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Get your API key from{" "}
                      <button
                        onClick={() => openApiKeyLink(config.apiKeyLink)}
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {config.name}
                      </button>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === "error"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-green-500/20 text-green-400 border border-green-500/30"
              }`}
            >
              {message.text}
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
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
