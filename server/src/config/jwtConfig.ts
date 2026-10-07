import crypto from "crypto";
export default process.env.JWT_SECRET ?? crypto.randomBytes(32).toString('hex');
