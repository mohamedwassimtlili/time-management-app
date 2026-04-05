import {

  getSchedule,
  getChat,
  getMemory,
  deleteMemory
} from "../services/ai.service.js";
import redis from "../utils/redis.client.js"; // use the one with host/port set
import axios from "axios";
const FASTAPI_URL = process.env.FASTAPI_URL; // points to FastAPI container
export const getIntent = async (req,res) => {
  
}
export const startPlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("test")

    const userSessionsKey = `user:${userId}:sessions`;
    const memoryKey = `ai-session:${userId}`; // ✅ defined

    const { project, startDate, endDate } = req.body;
    const result = await getSchedule(project, startDate, endDate, userId);
    console.log("test")
    await redis.sadd(userSessionsKey, memoryKey);
    await redis.set(memoryKey, JSON.stringify(result), "EX", 60 * 60 * 24); // ✅ key is now valid

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const continuePlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const memoryKey = `ai-session:${userId}`;

    const previousMemory = await redis.get(memoryKey);
    const payload = {
      prompt: req.body.prompt,
      memory: previousMemory
    };

    const response = await axios.post(`${FASTAPI_URL}/plan/chat`, payload);

    // ✅ Update memory with the latest response for next turn
    await redis.set(memoryKey, JSON.stringify(response.data), "EX", 60 * 60 * 24);

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to continue plan" });
  }
};

/*export const handlePrompt = async (req, res) => {
  try {
    const userId = req.user.userId;
    const memoryKey = `ai-session:${userId}`;

    // Step 1: detect intent first
    let intentResponse;
    try {
      intentResponse = await axios.post(`${FASTAPI_URL}/plan/intent`, {
        prompt: req.body.prompt,
      });
    } catch (err) {
      console.error("handlePrompt: failed to call FASTAPI /plan/intent:", err.message || err);
      return res.status(502).json({ error: "AI backend unreachable", detail: err.message || String(err) });
    }

    const { intent, start_date, end_date } = intentResponse.data;
    console.log(intent, start_date, end_date)
    console.log("**************************************************************************")
    console.log("**************************************************************************")
    console.log("**************************************************************************")
    console.log(intent)
    console.log("**************************************************************************")
    console.log("**************************************************************************")
    console.log("**************************************************************************")
    // Step 2: dispatch based on intent
    switch (intent) {

      case "generate_plan_no_dates":
        return res.json({
          intent: "generate_plan_no_dates",
          message: "It looks like you want to create a plan! Could you please provide both a start date and an end date?",
        });

      case "generate_plan": {
        // ✅ use getSchedule like startPlan does — it handles free slots
        let result;
        try {
          console.log("start date::::::::::::::::::::::::::", start_date);
          result = await getSchedule(req.body.prompt, start_date, end_date, userId);
          console.log(result);
          if (result === "") {
            return res.status(500).json({ res: "empty" });
          }
        } catch (err) {
          return res.status(500).json({ error: err.message });
        }
        console.log("**************************************************************************")
    console.log("**************************************************************************")
    console.log("**************************************************************************")
    console.log("**************************************************************************")
    console.log("**************************************************************************")
    console.log("**************************************************************************")
        await redis.set(memoryKey, JSON.stringify(result), "EX", 60 * 60 * 24);
        return res.json({ intent: "generate_plan", ...result });
      }

      case "modify_plan": {
        const previousMemory = await redis.get(memoryKey);
        const response = await axios.post(`${FASTAPI_URL}/plan/chat`, {
          prompt: req.body.prompt,
          memory: previousMemory || "[]",
        });
        await redis.set(memoryKey, JSON.stringify(response.data), "EX", 60 * 60 * 24);
        return res.json({ intent: "modify_plan", ...response.data });
      }

      case "general_question": {
        const response = await axios.post(`${FASTAPI_URL}/plan/handle`, {
          prompt: req.body.prompt,
          memory: "[]",
        });
        return res.json({ intent: "general_question", ...response.data });
      }

      default:
        return res.json({ intent: "unknown", message: "Could not understand your request." });
    }

  } catch (err) {
    res.status(500).json({ "error": err.message });
  }
}; */

export const handlePrompt = async (req, res) => {
  try {
    const userId = req.user.userId;
    const planKey = `plan:${userId}`;
    const conversationKey = `conversation:${userId}`;

    // ─── Load context BEFORE doing anything ───────────────────────────────────
    const [storedConversation, storedPlan] = await Promise.all([
      redis.get(conversationKey),
      redis.get(planKey),
    ]);

    let conversationHistory = [];
    let currentPlan = { tasks: [], sessions: [] };

    try { conversationHistory = storedConversation ? JSON.parse(storedConversation) : []; }
    catch { conversationHistory = []; }

    try { currentPlan = storedPlan ? JSON.parse(storedPlan) : { tasks: [], sessions: [] }; }
    catch { currentPlan = { tasks: [], sessions: [] }; }

    // ─── Detect intent ─────────────────────────────────────────────────────────
    const intentResponse = await axios.post(`${FASTAPI_URL}/plan/intent`, {
      prompt: req.body.prompt,
    });
    const { intent, start_date, end_date } = intentResponse.data;

    // ─── Helpers ───────────────────────────────────────────────────────────────
    const saveConversationTurn = async (userMsg, assistantMsg) => {
      conversationHistory.push({ role: "user", content: userMsg });
      conversationHistory.push({ role: "assistant", content: assistantMsg });
      try {
        await redis.set(conversationKey, JSON.stringify(conversationHistory), "EX", 60 * 60 * 24);
      } catch (err) {
        if (err.message && err.message.includes("maxRetriesPerRequest")) {
          // Keep only the most recent 6 messages to avoid the payload being too large
          if (conversationHistory.length > 6) {
            conversationHistory = conversationHistory.slice(-6);
          }
          await redis.set(conversationKey, JSON.stringify(conversationHistory), "EX", 60 * 60 * 24);
        } else {
          throw err;
        }
      }
    };

    const savePlan = async (tasks, sessions) => {
      await redis.set(planKey, JSON.stringify({ tasks, sessions }), "EX", 60 * 60 * 24);
    };

    // ─── Dispatch ──────────────────────────────────────────────────────────────
    switch (intent) {

      case "generate_plan_no_dates":
        return res.json({
          intent: "generate_plan_no_dates",
          message: "It looks like you want to create a plan! Could you please provide both a start date and an end date?",
        });

      case "generate_plan": {
        let result;
        try {
          result = await getSchedule(req.body.prompt, start_date, end_date, userId);
          if (!result || result === "") return res.status(500).json({ res: "empty" });
        } catch (err) {
          return res.status(500).json({ error: err.message });
        }

        await savePlan(result.tasks, result.sessions);
        await saveConversationTurn(req.body.prompt, result.explanation);

        return res.json({ intent: "generate_plan", ...result });
      }

      case "modify_plan": {
        const response = await axios.post(`${FASTAPI_URL}/plan/chat`, {
          prompt: req.body.prompt,
          memory: conversationHistory,
          current_plan: currentPlan,
        });

        if (response.data.tasks && response.data.sessions) {
          await savePlan(response.data.tasks, response.data.sessions);
        }
        await saveConversationTurn(req.body.prompt, response.data.explanation || "Plan updated.");

        return res.json({ intent: "modify_plan", ...response.data });
      }
      case "plan_question": {
  // Only needs the plan — no conversation history
  const fullPrompt = `
Current Plan:
${JSON.stringify(currentPlan, null, 2)}

User: ${req.body.prompt}
  `.trim();

  const response = await axios.post(`${FASTAPI_URL}/plan/handle`, {
    prompt: fullPrompt,
  });

  await saveConversationTurn(
    req.body.prompt,
    (response.data.answer || response.data.message || "").slice(0, 200)
  );

  return res.json({ intent: "plan_question", ...response.data });
}

case "general_question": {
  // Only needs conversation history — no plan data

  // Slice history if it exceeds 20 messages, and notify FastAPI
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
    await redis.set(conversationKey, JSON.stringify(conversationHistory), "EX", 60 * 60 * 24);
    await axios.post(`${FASTAPI_URL}/test-ai-token`, {
      history: conversationHistory,
    });
  }

  const recentHistory = conversationHistory
    .slice(-6)
    .map(turn => ({
      role: turn.role,
      content: turn.role === "assistant"
        ? turn.content.slice(0, 150) + (turn.content.length > 150 ? "..." : "")
        : turn.content
    }));
  const contextBlock = recentHistory
    .map(turn => `${turn.role === "user" ? "User" : "Assistant"}: ${turn.content}`)
    .join("\n");
  const fullPrompt = `
${contextBlock}
User: ${req.body.prompt}
  `.trim();
  const response = await axios.post(`${FASTAPI_URL}/plan/handle`, {
    prompt: fullPrompt,
  });
  await saveConversationTurn(
    req.body.prompt,
    (response.data.answer || response.data.message || "").slice(0, 200)
  );
  return res.json({ intent: "general_question", ...response.data });
}
      default:
        return res.json({ intent: "unknown", message: "Could not understand your request." });
    }

  } catch (err) {
    if (err.message && err.message.includes("maxRetriesPerRequest")) {
      const userId = req.user?.userId;
      if (userId) {
        const conversationKey = `conversation:${userId}`;
        const planKey = `plan:${userId}`;
        // The user has hit the Redis memory/timeout limit, clear old conversation history
        try {
          await redis.del(conversationKey);
        } catch(e) {}
        
        return res.status(500).json({ error: "Memory limit reached. Old messages cleared. Please try again." });
      }
    }
    res.status(500).json({ error: err.message });
  }
};


export const getMemoryController = async (req, res) => {
  try {
    const memory = await getMemory(req.user.userId);
    res.json(memory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMemoryController = async (req, res) => {
  try {
    const result = await deleteMemory(req.user.userId);
    res.json({ message: "Memory cleared", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};