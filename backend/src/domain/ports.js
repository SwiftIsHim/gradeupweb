/**
 * Port contracts (documentation only — plain JS has no interfaces).
 * infrastructure/* implements these by convention; application/use-cases/*
 * depends only on these shapes, never on Mongoose/bcrypt/Express directly.
 *
 * @typedef {Object} UserRepository
 * @property {(email: string) => Promise<import("./entities/User")|null>} findByEmail
 * @property {(email: string) => Promise<import("./entities/User")|null>} findByEmailWithPasswordHash
 * @property {(user: import("./entities/User")) => Promise<import("./entities/User")>} create
 * @property {(tokenHash: string) => Promise<import("./entities/User")|null>} findByResetTokenHash
 * @property {(userId: string, tokenHash: string, expiresAt: Date) => Promise<void>} setResetToken
 * @property {(userId: string, passwordHash: string) => Promise<import("./entities/User")>} updatePassword
 * @property {(username: string) => Promise<import("./entities/User")|null>} findByUsername
 * @property {(userId: string, username: string) => Promise<import("./entities/User")>} updateUsername
 * @property {(ids: string[]) => Promise<import("./entities/User")[]>} findByIds
 * @property {(query: string, opts: {excludeId: string, limit?: number}) => Promise<import("./entities/User")[]>} searchByUsernameOrName
 *
 * @typedef {Object} FriendshipRepository
 * @property {(friendship: import("./entities/Friendship")) => Promise<import("./entities/Friendship")>} create
 * @property {(id: string) => Promise<import("./entities/Friendship")|null>} findById
 * @property {(userIdA: string, userIdB: string) => Promise<import("./entities/Friendship")|null>} findBetween
 * @property {(userId: string) => Promise<import("./entities/Friendship")[]>} listAllInvolving
 * @property {(userIds: string[]) => Promise<import("./entities/Friendship")[]>} listAcceptedAmong
 * @property {(id: string) => Promise<import("./entities/Friendship")>} accept
 * @property {(id: string) => Promise<void>} deleteById
 *
 * @typedef {Object} CommunityRepository
 * @property {(community: import("./entities/Community")) => Promise<import("./entities/Community")>} create
 * @property {(id: string) => Promise<import("./entities/Community")|null>} findById
 * @property {(ids: string[]) => Promise<import("./entities/Community")[]>} listByIds
 * @property {(opts: {q?: string, limit?: number}) => Promise<import("./entities/Community")[]>} search
 * @property {(opts: {subjects: string[], examTag: string|null, excludeIds: string[], limit?: number}) => Promise<import("./entities/Community")[]>} findRecommended
 * @property {(id: string, delta: number) => Promise<void>} incrementMemberCount
 *
 * @typedef {Object} MembershipRepository
 * @property {(membership: import("./entities/Membership")) => Promise<import("./entities/Membership")>} create
 * @property {(userId: string, communityId: string) => Promise<import("./entities/Membership")|null>} findOne
 * @property {(userId: string, communityId: string) => Promise<void>} deleteOne
 * @property {(userId: string) => Promise<import("./entities/Membership")[]>} listByUser
 * @property {(communityId: string) => Promise<import("./entities/Membership")[]>} listByCommunity
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
 *
 * @typedef {Object} EmailSender
 * @property {(message: {to: string, subject: string, html: string, text: string}) => Promise<void>} send
 *   Never rejects — failures are logged and swallowed by the infrastructure
 *   implementation, so use cases can fire-and-forget without try/catch.
 */

module.exports = {};
