import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlProviderService } from '../url-provider-service/url-provider.service';

// --- NL query (data) ---

export interface ChatRequest {
  sessionId?: string;   // omit on the first message; the server creates one
  profile: string;      // e.g. "openaire"
  message: string;
}

export interface ChatResponse {
  sessionId: string;    // keep this and send it back on every subsequent turn
  reply: string;        // the assistant's text to show the user
  done: boolean;        // true when the query is fully resolved
  canonicalNl?: string; // populated when done — human-readable summary of the query (display only)
  sig?: string;         // populated when done — HMAC signature (also inside queryJson)
  sql?: string;         // populated when done — the generated SQL (informational)
  description?: string; // populated when done — plain-English sentence describing the query results
  queryJson?: NlQuery;  // populated when done — drop directly into chartsInfo[i].query
}

// --- NL options (appearance) ---

export interface OptionsRequest {
  sessionId?: string;   // omit on the first message; the server creates one
  library: string;      // "HighCharts", "eCharts", or "GoogleCharts"
  message: string;
}

export interface OptionsResponse {
  sessionId: string;
  reply: string;
  done: boolean;
  canonicalDescription?: string; // populated when done — concise appearance description
  sig?: string;                  // populated when done — HMAC signature
  optionsJson?: string;          // populated when done — chart options JSON string
  optionsElement?: OptionsElement;
}

export interface OptionsElement {
  nlOptions: string;
  optionsSig: string;
}

// --- Chart request ---

export interface ChartRequest {
  library: string;      // "HighCharts", "GoogleCharts", or "eCharts"
  chartsInfo: ChartInfo[];
  orderBy?: string;
  nlOptions?: string;   // canonicalDescription from OptionsResponse (optional)
  optionsSig?: string;  // sig from OptionsResponse (optional)
}

export interface ChartInfo {
  type: string;         // "bar", "line", "pie", etc.
  name?: string;
  query: NlQuery | DslQuery;
}

// NL query — produced from a completed chat session
export interface NlQuery {
  nl: string;           // canonicalNl from ChatResponse
  sig: string;          // sig from ChatResponse
  profile: string;      // same profile you passed to /nl/chat
  filters?: FilterGroup[]; // optional dashboard-injected filters (sig must cover these)
}

export interface FilterGroup {
  groupFilters: Filter[];
  op: 'AND' | 'OR';
}

export interface Filter {
  field: string;
  type: string;
  values: string[];
}

// DSL query — existing JSON DSL (unchanged)
export interface DslQuery {
  entity: string;
  select: object[];
  // ...other DSL fields
}

@Injectable({
  providedIn: 'root'
})
export class NlChatService {
  private http = inject(HttpClient);
  private urlProvider = inject(UrlProviderService);

  /**
   * Send a message in the NL query conversation
   */
  chat(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      `${this.urlProvider.serviceURL}/nl/chat`,
      request,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  /**
   * Send a message in the NL options conversation
   */
  optionsChat(request: OptionsRequest): Observable<OptionsResponse> {
    return this.http.post<OptionsResponse>(
      `${this.urlProvider.serviceURL}/nl/options/chat`,
      request,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  /**
   * Fetch chart data using a signed NL query
   */
  fetchChart(chartRequest: ChartRequest): Observable<unknown> {
    return this.http.post<unknown>(
      `${this.urlProvider.serviceURL}/chart`,
      chartRequest,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  /**
   * Returns the SQL and description for a previously signed NL query without executing it.
   * Use this when loading a chart URL to show metadata (e.g., a "Query info" panel).
   * Returns null if the query is not in cache (chart must be executed first).
   */
  nlInfo(
    profile: string,
    nl: string,
    sig: string,
    filters?: FilterGroup[]
  ): Observable<{ sql: string; description: string }> {
    let params = `profile=${encodeURIComponent(profile)}&nl=${encodeURIComponent(nl)}&sig=${encodeURIComponent(sig)}`;
    if (filters?.length) {
      params += `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
    }
    return this.http.get<{ sql: string; description: string }>(
      `${this.urlProvider.serviceURL}/nl/info?${params}`
    );
  }
}
