import { LoaderCircle } from "lucide-react";

export function ActivityLoader({
  label = "Loading",
  size = 40,
  className = "py-20",
}: {
  label?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div role="status" aria-label={label} className={`flex justify-center ${className}`}>
      <LoaderCircle size={size} className="animate-spin text-violet-500" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}