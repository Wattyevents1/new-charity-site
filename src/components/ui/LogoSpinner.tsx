import logo from "@/assets/logo.jpg";

interface LogoSpinnerProps {
  message?: string;
  className?: string;
}

const LogoSpinner = ({ message = "Loading...", className = "" }: LogoSpinnerProps) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-16 ${className}`}>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <img
          src={logo}
          alt="Loading"
          className="w-12 h-12 rounded-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
};

export default LogoSpinner;