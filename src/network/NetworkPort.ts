export interface NetworkPort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(payload: Uint8Array): void;
}
