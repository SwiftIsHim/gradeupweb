import { loginContent, type LoginPanelContent } from "@/lib/models/login"
import { brand, type BrandInfo } from "@/lib/models/nav"

export interface LoginPanelViewModel extends LoginPanelContent {
  brand: BrandInfo
}

export function getLoginPanelViewModel(): LoginPanelViewModel {
  return {
    ...loginContent.panel,
    brand,
  }
}
