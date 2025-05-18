// @/types/events.ts
export type Events = Array<{
    year: number;
    periodType: "Q" | "H";
    periodNumber: number;
    isChecked: boolean;
    events: Array<{
      title: string;
      isChecked: boolean;
      type?: string; // Add this
    }>;
  }>;