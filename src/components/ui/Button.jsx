import './Button.css';

export default function Button({ children, variant = 'primary', size = 'md', icon: Icon, disabled, onClick, type = 'button', className = '', ...props }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children && <span>{children}</span>}
    </button>
  );
}
