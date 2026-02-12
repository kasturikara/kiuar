// Logo upload component for QR code overlay
import { useCallback, useRef } from "react";
import { useGeneratorStore } from "../store";

const MAX_LOGO_SIZE_KB = 500;
const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
];

export const LogoUploader = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const logoFileName = useGeneratorStore((state) => state.logoFileName);
  const setLogo = useGeneratorStore((state) => state.setLogo);
  const clearLogo = useGeneratorStore((state) => state.clearLogo);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert("Please upload a PNG, JPEG, SVG, or WebP image.");
        e.target.value = "";
        return;
      }

      if (file.size > MAX_LOGO_SIZE_KB * 1024) {
        alert(`Logo file must be under ${MAX_LOGO_SIZE_KB}KB.`);
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setLogo(reader.result, file.name);
        }
      };
      reader.readAsDataURL(file);
    },
    [setLogo]
  );

  const handleClear = useCallback(() => {
    clearLogo();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [clearLogo]);

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">Logo Overlay (optional)</span>
      </label>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full max-w-xs"
        />
        {logoFileName && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleClear}
          >
            Clear
          </button>
        )}
      </div>
      {logoFileName && (
        <label className="label">
          <span className="label-text-alt text-success">
            Logo: {logoFileName}
          </span>
        </label>
      )}
      <label className="label">
        <span className="label-text-alt text-base-content/50">
          PNG, JPEG, SVG, or WebP. Max 500KB.
        </span>
      </label>
    </div>
  );
};
