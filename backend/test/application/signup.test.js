const test = require("node:test");
const assert = require("node:assert/strict");

const makeSignup = require("../../src/application/use-cases/auth/signup");
const User = require("../../src/domain/entities/User");
const { ValidationError, ConflictError } = require("../../src/domain/errors");

// In-memory fakes — no Mongoose/Express involved, proving the use case is
// testable in isolation once it only depends on ports. `create` must still
// return a real User entity, same as mongoUserRepository does, since callers
// rely on entity methods like toPublic().
function makeFakeUserRepository() {
  const byEmail = new Map();
  return {
    async findByEmail(email) {
      return byEmail.get(email) || null;
    },
    async findByEmailWithPasswordHash(email) {
      return byEmail.get(email) || null;
    },
    async create(user) {
      const stored = new User({ ...user, id: `id-${byEmail.size + 1}` });
      byEmail.set(user.email, stored);
      return stored;
    },
  };
}

const fakePasswordHasher = {
  async hash(plain) {
    return `hashed:${plain}`;
  },
  async verify(plain, hash) {
    return hash === `hashed:${plain}`;
  },
};

const fakeTokenService = {
  issue(user) {
    return { access_token: `token:${user.email}`, refresh_token: `refresh:${user.email}`, expires_in: 900 };
  },
};

function makeFakeEmailSender() {
  const sent = [];
  return { sent, async send(message) { sent.push(message); } };
}

function buildSignup() {
  return makeSignup({
    userRepository: makeFakeUserRepository(),
    passwordHasher: fakePasswordHasher,
    tokenService: fakeTokenService,
    emailSender: makeFakeEmailSender(),
  });
}

test("signup creates an account and returns a session", async () => {
  const signup = buildSignup();
  const session = await signup({
    email: "Student@Example.com",
    phone: "+2348012345678",
    name: "Ada",
    password: "supersecret",
  });

  assert.equal(session.user.email, "student@example.com");
  assert.equal(session.access_token, "token:student@example.com");
  assert.ok(session.expires_in > 0);
});

test("signup rejects a password shorter than 8 characters", async () => {
  const signup = buildSignup();
  await assert.rejects(
    () => signup({ email: "a@b.com", phone: "+2348012345678", password: "short" }),
    ValidationError
  );
});

test("signup rejects a duplicate email", async () => {
  const userRepository = makeFakeUserRepository();
  const signup = makeSignup({
    userRepository,
    passwordHasher: fakePasswordHasher,
    tokenService: fakeTokenService,
    emailSender: makeFakeEmailSender(),
  });
  const input = { email: "dupe@example.com", phone: "+2348012345678", password: "supersecret" };

  await signup(input);
  await assert.rejects(() => signup(input), ConflictError);
});

test("signup sends a welcome email", async () => {
  const emailSender = makeFakeEmailSender();
  const signup = makeSignup({
    userRepository: makeFakeUserRepository(),
    passwordHasher: fakePasswordHasher,
    tokenService: fakeTokenService,
    emailSender,
  });

  await signup({ email: "ada@example.com", phone: "+2348012345678", password: "supersecret" });

  assert.equal(emailSender.sent.length, 1);
  assert.equal(emailSender.sent[0].to, "ada@example.com");
});
