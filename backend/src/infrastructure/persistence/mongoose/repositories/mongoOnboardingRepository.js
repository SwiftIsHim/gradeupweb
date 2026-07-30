const OnboardingProfileModel = require("../schemas/onboardingProfile.schema");
const OnboardingProfile = require("../../../../domain/entities/OnboardingProfile");

function toEntity(doc) {
  if (!doc) return null;
  return new OnboardingProfile({
    id: doc._id ? String(doc._id) : undefined,
    userId: doc.user ? String(doc.user) : undefined,
    firstName: doc.firstName,
    lastName: doc.lastName,
    goal: doc.goal,
    gradeLevel: doc.gradeLevel,
    subjects: doc.subjects,
    examDateMode: doc.examDateMode,
    examDate: doc.examDate,
    dailyMinutes: doc.dailyMinutes,
    schedule: doc.schedule,
    notifications: doc.notifications,
    completedAt: doc.completedAt,
  });
}

/** @implements {import("../../../../domain/ports").OnboardingRepository} */
const mongoOnboardingRepository = {
  async findByUserId(userId) {
    const doc = await OnboardingProfileModel.findOne({ user: userId }).lean();
    return toEntity(doc);
  },

  async upsert(profile) {
    const doc = await OnboardingProfileModel.findOneAndUpdate(
      { user: profile.userId },
      { ...profile.toPublic(), user: profile.userId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    return toEntity(doc);
  },
};

module.exports = mongoOnboardingRepository;
