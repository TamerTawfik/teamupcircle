import { Spinner } from "@/components/spinner";

export default function Loading() {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  };

  return (
    <div style={containerStyle}>
      <Spinner />
    </div>
  );
}
