type StatusBadgeProps = {
  status: "Open" | "Resolved" | "In Progress";
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium
      ${
        status === "Open"
          ? "bg-red-100 text-red-600"
          : status === "Resolved"
            ? "bg-green-100 text-green-600"
            : "bg-orange-100 text-orange-600"
      }`}
    >
      {status}
    </span>
  );
}
