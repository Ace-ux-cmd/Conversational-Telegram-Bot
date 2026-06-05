const { GoogleGenAI } = require("@google/genai");

// Behavioral configurations based on user status
const { defaultConfig, adminConfig, ownerConfig } = require("../config/instruction");

// Core infrastructural dependencies and load balancing utility hooks
const getRandomKey = require("../utils/keyRotation");
const invalidKeys = require("../utils/invalidKeys");
const { getById } = require("../models/userModel");

async function aiGroupResponse(currentUser) {
  let assignedKey = null;

  try {
    // Fetch profile details from storage engine
    const user = await getById(currentUser.userId);
    
    // Safety Guard: Stop processing if the account is currently marked as banned
    if (user?.status === "banned") {
      return "yeah i'm not supposed be talking to you rn. if you think this is a mistake, type /callad and sort it out.";
    }

    // Pull an active key string from rotation array
    assignedKey = await getRandomKey();
    if (!assignedKey) {
      throw new Error("No operational API keys available in execution rotation array.");
    }

    // Initialize unified client instance matching the latest @google/genai SDK specifications
    const ai = new GoogleGenAI({ apiKey: assignedKey });

    // Assemble base target identity text rule configuration lines
    let systemInstructionText = defaultConfig;

    switch (user?.role) {
      case "owner":
        systemInstructionText += ownerConfig;
        break;
      case "admin":
        systemInstructionText += adminConfig;
        break;
    }

    // Append real-time metadata constraints dynamically to focus performance metrics
    systemInstructionText += 
      `\n\n[Runtime Context]\n` +
      `• Target User Name: ${currentUser.username || "Anonymous"}\n` +
      `• Current Timestamp: ${new Date().toISOString()}\n` +
      `Note: This is a shared group context. Keep it short, natural, and matching your persona constraints.`;

    // Payload Layout Assembly: Map inline conversational history nodes
    const contentPayload = [];

    // If this message targets a reply message thread node, inject context at index 0
    if (currentUser.replied_message) {
      contentPayload.push({
        role: "user",
        parts: [{ text: `[Context - replied to message]: "${currentUser.replied_message}"` }]
      });
      
      // Inject a mock assistant model acknowledgement to help the model maintain conversational context alignment
      contentPayload.push({
        role: "model",
        parts: [{ text: "got the context. what about it?" }]
      });
    }

    // Append the active message text directly into the generative array pipeline
    contentPayload.push({
      role: "user",
      parts: [{ text: currentUser.message }]
    });

    // Complete generation call using the updated SDK standards
    const responseWrapper = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contentPayload,
      config: {
        systemInstruction: systemInstructionText
      }
    });

    // Resolve text block output from the finalized schema response wrapper object
    const aiResponse = responseWrapper.text;
    return aiResponse || null;

  } catch (err) {
    console.error("Group AI Generation Service Engine Exception:", err.message);

    // Isolate and temporarily blacklist keys throwing 429 errors
    const errorStatusCode = err.status || err.statusCode || (err.response ? err.response.status : null);

    if (errorStatusCode === 429 && assignedKey) {
      // Log timestamp signature into the tracking cache layer to pause selection cycles
      invalidKeys.set(assignedKey, Date.now());
      return "i need a moment between thoughts, you know? slow down a little.";
    }

    // Catch-all safety boundary drop out prevents system loops from freezing the runtime engine
    return null;
  }
}

module.exports = { aiGroupResponse };