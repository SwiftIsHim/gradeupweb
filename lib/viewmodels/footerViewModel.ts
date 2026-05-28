import { footerContent, type FooterContent } from "@/lib/models/footer"
import { brand, type BrandInfo } from "@/lib/models/nav"

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
