import { z } from "zod";

export const createClearanceSchema = z.object({
  originBranchId: z.string().uuid(),
  destinationBranchId: z.string().uuid(),
  agentId: z.string().uuid(),
  agentWaybill: z.string().min(1),
  manifestNumbers: z.array(z.string().min(1)).min(1)
});
