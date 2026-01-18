// App Header component
import { Link } from "react-router-dom";
import { APP_NAME } from "@/config";

export const Header = () => {
  return (
    <header className="navbar bg-base-300">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="btn btn-ghost text-xl">
          {APP_NAME}
        </Link>
        <nav className="flex gap-2">
          <Link to="/" className="btn btn-ghost btn-sm">
            Generator
          </Link>
          <Link to="/history" className="btn btn-ghost btn-sm">
            History
          </Link>
        </nav>
      </div>
    </header>
  );
};
