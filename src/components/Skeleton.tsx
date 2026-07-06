export default function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', className = '', style = {} }: { width?: string | number, height?: string | number, borderRadius?: string | number, className?: string, style?: React.CSSProperties }) {
  return (
    <div 
      className={`skeleton ${className}`} 
      style={{ width, height, borderRadius, ...style }} 
    />
  );
}
