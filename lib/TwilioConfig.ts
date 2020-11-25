import twilio from "twilio";

import * as dotenv from "dotenv";
dotenv.config();

export default twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN, {
    lazyLoading: true,
});
