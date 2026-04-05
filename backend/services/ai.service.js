import axios from "axios";
import Session from "../models/session.model.js";
const FASTAPI_URL = "http://127.0.0.1:8000";
import redis from "../utils/redis.client.js";

  // Start plan
export const startPlanService = async (tasks, project) => {
  const response = await axios.post(`${FASTAPI_URL}/plan/start`, {
    tasks,
    project,
  });

  return response;
};

// Chat with plan
export const chatPlanService = async (sessionId, message) => {
  const response = await axios.post(`${FASTAPI_URL}/plan/chat`, {
    sessionId,
    message
  });

  return response.data;
};

// Update plan
export const updatePlanService = async (sessionId, message) => {
  const response = await axios.post(`${FASTAPI_URL}/plan/update`, {
    sessionId,
    message,
    model: "llama-3.1-8b-instant"
  });

  return response.data;
};




// services/planning.service.js

export const  getPlanningData = async (userId, startDate, endDate) => {
  if (!startDate || !endDate) {
    throw new Error("Missing startDate or endDate");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format");
  }

  const sessions = await Session.find({
    user: userId,
    startTime: { $lt: end },
    endTime: { $gt: start }
  });

  return { sessions };
};


export const transformForFastAPI = (projectName, sessions, start , end) => {
  // Map MongoDB sessions to the FastAPI expected format
  const tasks = sessions.map((s) => ({
    start: s.startTime.toISOString(),
    end: s.endTime.toISOString()
  }));

  return {
    project: projectName,
    tasks,
    startDate:start,
    endDate:end
  };
};


export const getSchedule = async (projectName, startDate, endDate, userId) => {
  console.log("scheduleeee")
  try {
    const data = await getPlanningData(
      userId,
      new Date(startDate),
      new Date(endDate)
    );

    console.log("retrieved sessions : \n", data);

    // Transform sessions for FastAPI
    const payload = transformForFastAPI(projectName, data.sessions,new Date(startDate),new Date(endDate));

    const aiResponse = await axios.post(
      "http://127.0.0.1:8000/plan/start",
      payload
    );

    console.log("ai response :\n", aiResponse.data);

    return aiResponse.data; // return AI plan & explanation
  } catch (err) {
    console.error(err);
    throw new Error("Planning failed");
  }
};

export const getChat = async (projectName, startDate, endDate, userId) => {
  console.log("scheduleeee")
  try {
    const data = await getPlanningData(
      userId,
      new Date(startDate),
      new Date(endDate)
    );

    console.log("retrieved sessions : \n", data);

    // Transform sessions for FastAPI
    const payload = transformForFastAPI(projectName, data);

    const aiResponse = await axios.post(
      "http://127.0.0.1:8000/plan/chat",
      payload
    );

    console.log("ai response :\n", aiResponse.data);

    return aiResponse.data; // return AI plan & explanation
  } catch (err) {
    console.error(err);
    throw new Error("Planning failed");
  }
};

export const getMemory = async (userId) => {
  const planKey = `plan:${userId}`;
  const conversationKey = `conversation:${userId}`;

  const [storedPlan, storedConversation] = await Promise.all([
    redis.get(planKey),
    redis.get(conversationKey),
  ]);

  const plan = storedPlan ? JSON.parse(storedPlan) : { tasks: [], sessions: [] };
  const conversation = storedConversation ? JSON.parse(storedConversation) : [];

  return { plan, conversation };
};

export const deleteMemory = async (userId) => {
  const planKey = `plan:${userId}`;
  const conversationKey = `conversation:${userId}`;

  const [deletedPlan, deletedConversation] = await Promise.all([
    redis.del(planKey),
    redis.del(conversationKey),
  ]);

  return {
    plan: deletedPlan === 1 ? "deleted" : "not found",
    conversation: deletedConversation === 1 ? "deleted" : "not found",
  };
};


