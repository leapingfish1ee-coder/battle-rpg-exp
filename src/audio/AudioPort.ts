export interface AudioPort {
  resume(): Promise<void>;
  setMasterVolume(volume: number): void;
  dispose(): void;
}
