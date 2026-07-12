const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const client = new OAuth2Client();

const oauth2Client = new google.auth.OAuth2(process.env.WEB_GOOGLE_CLIENT_ID);

// Jedinstveni "app" JWT koji izdajemo NAKON uspješnog logina, bilo preko
// email/lozinke ili preko Google-a. Payload sadrži userId i email - "sub"
// (Google identifikator) se nigdje vise ne koristi niti sprema.
const signToken = function (user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
  );
};

const verifyToken = function (token) {
  return jwt.verify(token, process.env.JWT_SECRET_KEY);
};

const verifyGoogleToken = async function (idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: [process.env.WEB_GOOGLE_CLIENT_ID],
    });
    const payload = ticket.getPayload();
    return payload; // holds email,name....}
  } catch (err) {
    return null;
  }
};

const getRefreshAndIdToken = async function (authToken) {
  try {
    const { tokens } = await oauth2Client.getToken(authToken);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (err) {
    //console.log("getRefreshAndIdToken", err);
  }
};

const refreshIdToken = async function (idToken) {
  const { email } = jwt.decode(idToken);
  const { refresh_token } = await prisma.users.findUnique({
    where: { email: email },
  });

  oauth2Client.setCredentials({
    refresh_token: refresh_token,
  });
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    const idToken = credentials.id_token;
    return idToken;
  } catch (err) {
    //console.log("refreshIdToken", err);
  }
};

module.exports = {
  verifyGoogleToken,
  getRefreshAndIdToken,
  refreshIdToken,
  signToken,
  verifyToken,
};
