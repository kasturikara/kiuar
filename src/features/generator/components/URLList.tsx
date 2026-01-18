// URL list display component
import { useGeneratorStore } from "../store";

export const URLList = () => {
  const urls = useGeneratorStore((state) => state.urls);
  const removeUrl = useGeneratorStore((state) => state.removeUrl);
  const clearUrls = useGeneratorStore((state) => state.clearUrls);

  if (urls.length === 0) {
    return (
      <div className="text-center text-base-content/60 py-8">
        No URLs added yet. Add URLs manually or upload a CSV file.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-base-content/70">
          {urls.length} URL(s) added
        </span>
        <button className="btn btn-ghost btn-sm" onClick={clearUrls}>
          Clear All
        </button>
      </div>
      <ul className="space-y-1 max-h-48 overflow-y-auto">
        {urls.map((url, index) => (
          <li
            key={index}
            className="flex items-center justify-between bg-base-200 px-3 py-2 rounded"
          >
            <span className="truncate flex-1">{url}</span>
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => removeUrl(index)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
