export type ResourceStatus = "active" | "inactive";

export interface Resource {
  id: string;
  name: string;
  type: string;
  status: ResourceStatus;
  metadata: Record<string, unknown>;
  created_at: string; // ISO
  updated_at: string; // ISO
}

export interface CreateResourceInput {
  name: string;
  type: string;
  status?: ResourceStatus;
  metadata?: Record<string, unknown>;
}

export interface UpdateResourceInput {
  name?: string;
  type?: string;
  status?: ResourceStatus;
  metadata?: Record<string, unknown>;
}
