import dotenv from "dotenv";

// Load environment variables from .env.development file
dotenv.config({
    path: ".env.development",
});

const config = {
    ...process.env,
};

export default config;
