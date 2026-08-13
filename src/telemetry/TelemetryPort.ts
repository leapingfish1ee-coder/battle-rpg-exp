export type TelemetryFields = Readonly<Record<string, string | number | boolean>>;

export interface TelemetryPort {
  counter(name: string, value?: number, fields?: TelemetryFields): void;
  timing(name: string, milliseconds: number, fields?: TelemetryFields): void;
}
