import { useBackground } from "../hooks/useBackground";

export default function BackgroundWrapper({ children }) {
  const { bg, overlay, blur } = useBackground();

  const hasBackground = !!bg;

  const wrapperStyle = hasBackground
    ? bg.startsWith("linear-gradient")
      ? { background: bg }
      : {
          backgroundImage: `linear-gradient(rgba(0,0,0,${overlay / 100}),rgba(0,0,0,${overlay / 100})),url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }
    : {};

  return (
    <div
      style={wrapperStyle}
      className={`min-h-screen transition-all duration-700 ${hasBackground ? "bg-wrapper-active" : ""}`}
    >
      {/* Blur layer behind everything */}
      {blur > 0 && hasBackground && !bg.startsWith("linear-gradient") && (
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            filter: `blur(${blur}px) brightness(${1 - overlay / 200})`,
          }}
        />
      )}
      {children}
    </div>
  );
}