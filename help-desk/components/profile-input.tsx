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
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "#7A5C44",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: 42,
          border: "1.5px solid #EDE0D0",
          borderRadius: 9,
          padding: "0 14px",
          fontSize: 13,
          fontFamily: "inherit",
          color: "#1A0F08",
          background: "#FDFAF6",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#6B2D0F")}
        onBlur={(e)  => (e.target.style.borderColor = "#EDE0D0")}
      />
    </div>
  );
}