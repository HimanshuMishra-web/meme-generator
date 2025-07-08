import constants from "../constants.json";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/meme_generator";
const PORT = process.env.PORT || 7894;
const HOST = process.env.HOST || "localhost";

const { ADMIN_ROLE, USER_ROLE } = constants;

const {EMAIL_PASS, EMAIL_USER} = process.env;

export  {
  EMAIL_USER,
  EMAIL_PASS,
  HOST,
  PORT,
  MONGO_URI,

  ADMIN_ROLE,
  USER_ROLE
};