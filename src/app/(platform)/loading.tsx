import { Loader2 } from "lucide-react";

export default function Loading() {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  };

  return (
    <div style={containerStyle}>
      <Loader2 className="mx-auto my-3 animate-spin" />
    </div>
  );
}
