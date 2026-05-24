export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type AnyTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

export type LooseDatabase = {
  public: {
    Tables: Record<string, AnyTable>;
    Views: Record<string, AnyTable>;
    Functions: Record<string, never>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, never>;
  };
};
