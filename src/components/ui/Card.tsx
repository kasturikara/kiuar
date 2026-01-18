// Card wrapper component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div className={`card bg-base-200 shadow-xl ${className}`}>
      <div className="card-body">{children}</div>
    </div>
  );
};
