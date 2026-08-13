export type AssetBundleId = string;

export interface AssetService {
  loadBundle(bundleId: AssetBundleId): Promise<void>;
  unloadBundle(bundleId: AssetBundleId): Promise<void>;
}
