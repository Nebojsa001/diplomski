const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const client = new OAuth2Client();

const oauth2Client = new google.auth.OAuth2(
  process.env.WEB_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.SITE_URL,
);

const verifyGoogleToken = async function (idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: [
        process.env.ANDROID_GOOGLE_CLIENT_ID,
        process.env.TEST_GOOGLE_CLIENT_ID,
        process.env.WEB_GOOGLE_CLIENT_ID,
      ],
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
};
