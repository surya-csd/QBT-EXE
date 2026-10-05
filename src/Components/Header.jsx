import "./Header.css";

export default function Header({ isOpen, setIsOpen, title, children }) {
  return (
    <header className="header">
      <button
        className="menu-icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <h1 className="page-title">
        {title}
      </h1>

      {children}
    </header>
  );
}