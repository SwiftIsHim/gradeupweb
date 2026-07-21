/**
 * Composition root — the one place that wires concrete infrastructure
 * (Mongoose repositories, bcrypt, the stub token service) into use cases and
 * then into HTTP controllers/routes. Nothing outside this file should import
 * both an infrastructure/* module and an application/* or interfaces/*
 * module in the same file — that seam is what keeps the domain/application
 * layers framework-agnostic and unit-testable without Mongo or Express.
 */

const mongoUserRepository = require("../infrastructure/persistence/mongoose/repositories/mongoUserRepository");
const mongoOnboardingRepository = require("../infrastructure/persistence/mongoose/repositories/mongoOnboardingRepository");
const mongoProgressRepository = require("../infrastructure/persistence/mongoose/repositories/mongoProgressRepository");
const { makeMongoAttemptRepository } = require("../infrastructure/persistence/mongoose/repositories/mongoAttemptRepository");
const bcryptPasswordHasher = require("../infrastructure/security/bcryptPasswordHasher");
const stubTokenService = require("../infrastructure/security/stubTokenService");
const resendEmailSender = require("../infrastructure/email/resendEmailSender");

const makeCheckAccountExists = require("../application/use-cases/auth/checkAccountExists");
const makeLogin = require("../application/use-cases/auth/login");
const makeSignup = require("../application/use-cases/auth/signup");
const makeSaveOnboarding = require("../application/use-cases/onboarding/saveOnboarding");
const makeGetOnboarding = require("../application/use-cases/onboarding/getOnboarding");
const makeListProgress = require("../application/use-cases/progress/listProgress");
const makeGetCourseProgress = require("../application/use-cases/progress/getCourseProgress");
const makeMarkChapterComplete = require("../application/use-cases/progress/markChapterComplete");
const makeSaveQuizResult = require("../application/use-cases/progress/saveQuizResult");
const makeRecordAttempt = require("../application/use-cases/attempts/recordAttempt");
const makeListAttempts = require("../application/use-cases/attempts/listAttempts");
const makeListAttemptsForSlug = require("../application/use-cases/attempts/listAttemptsForSlug");

const makeAuthController = require("../interfaces/http/controllers/auth.controller");
const makeOnboardingController = require("../interfaces/http/controllers/onboarding.controller");
const makeProgressController = require("../interfaces/http/controllers/progress.controller");
const makeAttemptController = require("../interfaces/http/controllers/attempt.controller");
const makeRequireAuth = require("../interfaces/http/middleware/requireAuth");
const makeRoutes = require("../interfaces/http/routes");

function buildAttemptController(kind) {
  const attemptRepository = makeMongoAttemptRepository(kind);
  return makeAttemptController({
    recordAttempt: makeRecordAttempt({ attemptRepository }),
    listAttempts: makeListAttempts({ attemptRepository }),
    listAttemptsForSlug: makeListAttemptsForSlug({ attemptRepository }),
  });
}

/** Build the fully-wired Express router for the app to mount. */
function buildRoutes() {
  const userRepository = mongoUserRepository;
  const onboardingRepository = mongoOnboardingRepository;
  const progressRepository = mongoProgressRepository;
  const passwordHasher = bcryptPasswordHasher;
  const tokenService = stubTokenService;
  const emailSender = resendEmailSender;

  const authController = makeAuthController({
    checkAccountExists: makeCheckAccountExists({ userRepository }),
    login: makeLogin({ userRepository, passwordHasher, tokenService }),
    signup: makeSignup({ userRepository, passwordHasher, tokenService, emailSender }),
  });

  const onboardingController = makeOnboardingController({
    saveOnboarding: makeSaveOnboarding({ onboardingRepository }),
    getOnboarding: makeGetOnboarding({ onboardingRepository }),
  });

  const progressController = makeProgressController({
    listProgress: makeListProgress({ progressRepository }),
    getCourseProgress: makeGetCourseProgress({ progressRepository }),
    markChapterComplete: makeMarkChapterComplete({ progressRepository }),
    saveQuizResult: makeSaveQuizResult({ progressRepository }),
  });

  const requireAuth = makeRequireAuth({ tokenService, userRepository });

  return makeRoutes({
    authController,
    onboardingController,
    progressController,
    testAttemptController: buildAttemptController("test"),
    diagnosticAttemptController: buildAttemptController("diagnostic"),
    requireAuth,
  });
}

module.exports = { buildRoutes };
