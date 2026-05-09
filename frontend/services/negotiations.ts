import { apiClient } from "@/lib/axios";
import type { Negotiation, NegotiationStatus } from "@/types/api";

export interface CreateNegotiationPayload {
  offer_post_id: string;
  request_post_id: string;
  auto_accept?: boolean;
}

export interface UpdateNegotiationPayload {
  status?: NegotiationStatus;
  pickup_location?: string;
  dropoff_location?: string;
  departure_time?: string;
  fare?: number;
  note?: string;
}

export const negotiationsService = {
  async list(status?: NegotiationStatus): Promise<Negotiation[]> {
    const { data } = await apiClient.get<Negotiation[]>("/negotiations", {
      params: status ? { status } : {},
    });
    return data;
  },

  async get(id: string): Promise<Negotiation> {
    const { data } = await apiClient.get<Negotiation>(`/negotiations/${id}`);
    return data;
  },

  async create(payload: CreateNegotiationPayload): Promise<Negotiation> {
    const { data } = await apiClient.post<Negotiation>("/negotiations", payload);
    return data;
  },

  async update(id: string, payload: UpdateNegotiationPayload): Promise<Negotiation> {
    const { data } = await apiClient.patch<Negotiation>(`/negotiations/${id}`, payload);
    return data;
  },

  async confirm(id: string): Promise<Negotiation> {
    const { data } = await apiClient.post<Negotiation>(`/negotiations/${id}/confirm`);
    return data;
  },
};
