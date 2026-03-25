import prisma from "../prisma.js";

// GET all agents
export async function getAgents(req, res) {
  try {

    const agents = await prisma.agent.findMany({
      orderBy: { name: "asc" }
    });

    res.json(agents);

  } catch (err) {
    console.error("GET AGENTS ERROR:", err);
    res.status(500).json({ message: "Failed to load agents" });
  }
}

// CREATE agent (basic version for now)
export async function createAgent(req, res) {
  try {

    const { name, transportType } = req.body;

    if (!name || !transportType) {
      return res.status(400).json({
        message: "Name and transportType are required"
      });
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        transportType
      }
    });

    res.json(agent);

  } catch (err) {
    console.error("CREATE AGENT ERROR:", err);
    res.status(500).json({ message: "Failed to create agent" });
  }
}