// Redirect page - handles /r/:code routes for scan tracking
import { useRedirect } from "@/features/redirect";

const RedirectPage = () => {
  const { error, loading } = useRedirect();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-error mb-2">Error</h1>
        <p className="text-base-content/70">{error}</p>
      </div>
    );
  }

  return null;
};

export default RedirectPage;
