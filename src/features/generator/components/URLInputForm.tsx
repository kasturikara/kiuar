// URL Input form component
import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { isValidUrl, normalizeUrl } from "@/utils";
import { useGeneratorStore } from "../store";

export const URLInputForm = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const addUrl = useGeneratorStore((state) => state.addUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(url);

    if (!isValidUrl(normalized)) {
      setError("Please enter a valid URL");
      return;
    }

    addUrl(normalized);
    setUrl("");
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Enter URL (e.g., https://example.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        error={error}
        className="flex-1"
      />
      <Button type="submit">Add URL</Button>
    </form>
  );
};
