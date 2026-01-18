// Hook for handling redirect logic and tracking
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { qrItemApi, qrScanApi } from "@/services";

export const useRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!code) {
        setError("Invalid redirect code");
        setLoading(false);
        return;
      }

      try {
        const qrItem = await qrItemApi.getByShortCode(code);

        if (!qrItem) {
          setError("QR code not found or inactive");
          setLoading(false);
          return;
        }

        // Track the scan
        await qrScanApi.create({
          qr_item_id: qrItem.id,
          user_agent: navigator.userAgent,
        });

        // Increment scan count
        await qrItemApi.incrementScanCount(qrItem.id);

        // Redirect to the target URL
        window.location.href = qrItem.original_url;
      } catch {
        setError("Failed to process redirect");
        setLoading(false);
      }
    };

    handleRedirect();
  }, [code]);

  return { error, loading };
};
