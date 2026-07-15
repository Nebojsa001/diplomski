const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = require("../prisma/hooks/userHooks");
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");
const {
  verifyGoogleToken,
  signToken,
  verifyToken,
} = require("../utils/authUtils");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeUser(user) {
  // Nikada ne vracamo hash lozinke na frontend
  const { password, ...safeUser } = user;
  return safeUser;
}

exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, passwordConfirm, role } =
    req.body;

  if (!firstName || !lastName || !email || !password) {
    return next(
      new appError("Ime, prezime, email i lozinka su obavezni.", 400),
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return next(new appError("Email adresa nije validna.", 400));
  }

  if (password.length < 8) {
    return next(new appError("Lozinka mora imati najmanje 8 karaktera.", 400));
  }

  if (passwordConfirm !== undefined && password !== passwordConfirm) {
    return next(new appError("Lozinke se ne podudaraju.", 400));
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return next(new appError("Korisnik sa ovim emailom već postoji.", 409));
  }

  // Dozvoljavamo samo "patient" kao samostalni odabir prilikom registracije;
  // "doctor" nalozi se kreiraju preko baze
  const safeRole = role === "doctor" ? "doctor" : "patient";

  // hashovanje lozinke se izvrsava automatski kroz Prisma middleware
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password,
      role: safeRole,
    },
  });

  const token = signToken(user);

  res.status(201).json({
    status: "success",
    message: "Registracija uspješna!",
    token,
    user: sanitizeUser(user),
  });
});

//
// LOGIN (email + lozinka)
//
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new appError("Email i lozinka su obavezni.", 400));
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    return next(new appError("Pogrešan email ili lozinka.", 401));
  }

  const isCorrect = await bcrypt.compare(password, user.password);

  if (!isCorrect) {
    return next(new appError("Pogrešan email ili lozinka.", 401));
  }

  const token = signToken(user);

  res.status(200).json({
    status: "success",
    message: "Prijava uspješna!",
    token,
    user: sanitizeUser(user),
  });
});

exports.googleLogin = catchAsync(async (req, res, next) => {
  const idToken = req.body.credential;

  if (!idToken) {
    return next(new appError("Google token nije proslijeđen.", 400));
  }

  const payload = await verifyGoogleToken(idToken);

  if (!payload || !payload.email) {
    return next(new appError("Google prijava nije uspjela.", 401));
  }

  let user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: payload.email,
        firstName: payload.given_name || "Korisnik",
        lastName: payload.family_name || "",
      },
    });
  }

  const token = signToken(user);

  res.status(200).json({
    status: "success",
    message: "Prijava uspješna!",
    token,
    user: sanitizeUser(user),
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new appError("Log in!", 401));
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    return next(
      new appError("Nevažeći ili istekao token. Prijavite se ponovo!", 401),
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    return next(new appError("User not found!", 404));
  }

  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  // PERMISIJE
  return (req, res, next) => {
    // roles ['doctor','superadmin','patient'].
    if (!roles.includes(req.user.role)) {
      return next(new appError("Nemate ovlaštenje za ovu akciju", 403));
    }
    next();
  };
};
