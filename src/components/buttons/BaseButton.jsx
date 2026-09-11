export default function BaseButton({ onClick, disabled, isActive, activeColor, title, children }) {
  const getBackground = () => {
    if (disabled) return '#0f172a';
    if (isActive) return activeColor;
    return '#1e293b'; // Default dark toolbar theme
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: getBackground(),
        color: disabled ? '#475569' : '#fff',
        border: 'none',
        padding: '4px',
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '16px',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {children}
    </button>
  );
}
