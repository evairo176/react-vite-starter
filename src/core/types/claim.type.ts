import { z } from "zod";
export interface IClaim {
  id: string;
  name: string;
  desc: string;
  status: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: CreatedBy;
  logs: Log[];
}

interface Log {
  id: string;
  claimId: string;
  actorId: string;
  fromStatus: string;
  toStatus: string;
  note: null | string;
  createdAt: string;
  actor: CreatedBy;
}

interface CreatedBy {
  id: string;
  name: string;
}

export const rejectClaimSchema = z.object({
  note: z.string(),
});

export const createClaimSchema = z.object({
  name: z.string(),
  desc: z.string(),
});

export const submitClaimSchema = z.object({});

export type rejectClaimDTO = z.infer<typeof rejectClaimSchema>;
export type createClaimDTO = z.infer<typeof createClaimSchema>;
