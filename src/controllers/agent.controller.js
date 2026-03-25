export async function getAgents(req, res) {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { name: "asc" }
    });

    res.json(agents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load agents" });
  }
}

export async function createAgent(req, res) {
  try {
    const { name } = req.body;

    const agent = await prisma.agent.create({
      data: { name }
    });

    res.json(agent);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create agent" });
  }
}