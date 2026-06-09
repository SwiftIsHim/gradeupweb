import { heroContent, type HeroContent } from "@/src/landing-page/model/hero"

export interface HeroViewModel extends HeroContent {
  ratingStars: number
}

export function getHeroViewModel(): HeroViewModel {
  return {
    ...heroContent,
    ratingStars: Math.round(heroContent.rating.score),
  }
}
