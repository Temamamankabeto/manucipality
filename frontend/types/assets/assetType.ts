export interface AssetGroup {
  id: number;
  name: string;
  description?: string;
}

export interface Asset {
  id: number;
  asset_name: string;
  asset_code: string;
}

export interface AssetType {
  id: number;
  name: "General" | "Fixed";
  description?: string;

  assetGroups?: AssetGroup[];
  assets?: Asset[];
}

export interface PaginatedAssetType {
  data: AssetType[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}