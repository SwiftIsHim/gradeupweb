import { footerContent, type FooterContent } from "@/src/landing-page/model/footer"
import { brand, type BrandInfo } from "@/src/landing-page/model/nav"

export interface FooterViewModel extends FooterContent {
  brand: BrandInfo
  year: number
}

export function getFooterViewModel(): FooterViewModel {
  return {
    ...footerContent,
    brand,
    year: new Date().getFullYear(),
  }
}
