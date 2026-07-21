/**
 * Port contracts (documentation only — plain JS has no interfaces).
 * infrastructure/* implements these by convention; application/use-cases/*
 * depends only on these shapes, never on Mongoose/bcrypt/Express directly.
 *
 * @typedef {Object} UserRepository
 * @property {(email: string) => Promise<import("./entities/User")|null>} findByEmail
 * @property {(email: string) => Promise<import("./entities/User")|null>} findByEmailWithPasswordHash
 * @property {(user: import("./entities/User")) => Promise<import("./entities/User")>} create
 *
 * @typedef {Object} OnboardingRepository
 * @property {(userId: string) => Promise<import("./entities/OnboardingProfile")|null>} findByUserId
 * @property {(profile: import("./entities/OnboardingProfile")) => Promise<import("./entities/OnboardingProfile")>} upsert
 *
 * @typedef {Object} ProgressRepository
 * @property {(userId: string) => Promise<import("./entities/CourseProgress")[]>} listByUser
 * @property {(userId: string, courseSlug: string) => Promise<import("./entities/CourseProgress")|null>} findOne
 * @property {(userId: string, courseSlug: string, chapterNumber: number) => Promise<import("./entities/CourseProgress")>} addCompletedChapter
 * @property {(userId: string, courseSlug: string, chapterNumber: number, score: number, total: number) => Promise<import("./entities/CourseProgress")>} upsertQuizResult
 *
 * @typedef {Object} AttemptRepository
 * @property {(userId: string) => Promise<import("./entities/Attempt")[]>} listByUser
 * @property {(userId: string, slug: string) => Promise<import("./entities/Attempt")[]>} listByUserAndSlug
 * @property {(attempt: import("./entities/Attempt")) => Promise<import("./entities/Attempt")>} create
 *
 * @typedef {Object} PasswordHasher
 * @property {(plain: string) => Promise<string>} hash
 * @property {(plain: string, hash: string) => Promise<boolean>} verify
 *
 * @typedef {Object} TokenService
 * @property {(user: import("./entities/User")) => { access_token: string, refresh_token: string, expires_in: number }} issue
 * @property {(token: string) => string|null} decodeEmail
 */

module.exports = {};
