import { configDotenv } from "dotenv";
configDotenv()

import { defineConfig } from 'drizzle-kit'

if(!process.env.DATABASE_URL){
    throw new Error(" Database url is not set in .env file")
}

export default defineConfig({
    schema:"./src/database/schema.js",
    out:"./drizzel",
    dialect:'postgresql',
    dbCredentials:{
        url: process.env.DATABASE_URL,
    }
})