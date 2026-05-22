type ProfileInputProps = {
  label: string;
  placeholder?: string;
  value?: string;
  type?: string;
};

export default function ProfileInput({
  label,
  placeholder,
  value,
  type = "text",
}: ProfileInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-black">{label}</label>

      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="
          w-full
          border
          border-gray-300
          rounded-md
          px-4
          py-3
          outline-none
          focus:ring-2
          focus:ring-green-700
          bg-white
        "
      />
    </div>
  );
}
