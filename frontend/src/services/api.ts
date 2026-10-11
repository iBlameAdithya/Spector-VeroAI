import type {
  HealthResponse,
  TraceRequest,
  TraceResponse,
  PrepareFreezeRequest,
  PrepareFreezeResponse,
  SignAndSubmitRequest,
  SignAndSubmitResponse,
  SahyogPackageRequest,
  SahyogPackage,
} from '../types/api';

export const API_BASE = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_URL || 'http://172.16.218.210:8081/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

export const api = {
  async checkHealth(): Promise<HealthResponse> {
    try {
      return await fetchJson<HealthResponse>(`${API_BASE}/health`);
    } catch {
      try {
        return await fetchJson<HealthResponse>('http://localhost:8081/api/v1/health');
      } catch {
        return await fetchJson<HealthResponse>('/api/v1/health');
      }
    }
  },

  async runTrace(request: TraceRequest): Promise<TraceResponse> {
    try {
      return await fetchJson<TraceResponse>(`${API_BASE}/trace`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch {
      try {
        return await fetchJson<TraceResponse>('http://localhost:8081/api/v1/trace', {
          method: 'POST',
          body: JSON.stringify(request),
        });
      } catch {
        return await fetchJson<TraceResponse>('/api/v1/trace', {
          method: 'POST',
          body: JSON.stringify(request),
        });
      }
    }
  },

  async prepareFreeze(request: PrepareFreezeRequest): Promise<PrepareFreezeResponse> {
    try {
      return await fetchJson<PrepareFreezeResponse>(`${API_BASE}/agent/prepare-freeze`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch {
      try {
        return await fetchJson<PrepareFreezeResponse>('http://localhost:8081/api/v1/agent/prepare-freeze', {
          method: 'POST',
          body: JSON.stringify(request),
        });
      } catch {
        return await fetchJson<PrepareFreezeResponse>('/api/v1/agent/prepare-freeze', {
          method: 'POST',
          body: JSON.stringify(request),
        });
      }
    }
  },

  async signAndSubmitFreeze(request: SignAndSubmitRequest): Promise<SignAndSubmitResponse> {
    try {
      return await fetchJson<SignAndSubmitResponse>(`${API_BASE}/agent/sign-and-submit`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch {
      try {
        return await fetchJson<SignAndSubmitResponse>('http://localhost:8081/api/v1/agent/sign-and-submit', {
          method: 'POST',
          body: JSON.stringify(request),
        });
      } catch {
        return await fetchJson<SignAndSubmitResponse>('/api/v1/agent/sign-and-submit', {
          method: 'POST',
          body: JSON.stringify(request),
        });
      }
    }
  },

  async generateSahyogPackage(request: SahyogPackageRequest): Promise<SahyogPackage> {
    try {
      return await fetchJson<SahyogPackage>(`${API_BASE}/sahyog/package`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch {
      try {
        return await fetchJson<SahyogPackage>('http://localhost:8081/api/v1/sahyog/package', {
          method: 'POST',
          body: JSON.stringify(request),
        });
      } catch {
        return await fetchJson<SahyogPackage>('/api/v1/sahyog/package', {
          method: 'POST',
          body: JSON.stringify(request),
        });
      }
    }
  }
};
