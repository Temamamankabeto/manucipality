"use client";

import { useEffect, useState } from "react";
import { assetTypeService } from "@/services/assets/assetTypeService";
import { AssetType } from "@/types/assets/assetType";

export function useAssetTypes(page = 1) {
  const [data, setData] = useState<AssetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await assetTypeService.getAll(page);

      if (res.success) {
        setData(res.data.data); // Laravel paginate structure
        setPagination(res.data);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  return { data, loading, error, pagination, refetch: fetchData };
}