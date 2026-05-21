type StatCardProps = {
  title: string;
  value: string;
  color: "red" | "green";
};

export default function StatCard({ title, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 flex items-center justify-between">
      <div>
        <p className="text-gray-500">{title}</p>

        <h2 className="text-4xl font-bold mt-2">{value}</h2>
      </div>

      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold
        ${
          color === "red"
            ? "bg-red-100 text-red-600"
            : "bg-green-100 text-green-600"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
