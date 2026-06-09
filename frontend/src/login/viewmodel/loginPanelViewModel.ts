import { loginContent, type LoginPanelContent } from "@/src/login/model/login"
import { brand, type BrandInfo } from "@/src/landing-page/model/nav"

export interface LoginPanelViewModel extends LoginPanelContent {
  brand: BrandInfo
}

export function getLoginPanelViewModel(): LoginPanelViewModel {
  return {
    ...loginContent.panel,
    brand,
  }
}
