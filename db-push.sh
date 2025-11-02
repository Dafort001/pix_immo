#!/bin/bash
# Database migration wrapper for Replit Publishing
# This validates that the database schema exists instead of running drizzle-kit push
# which hangs during the "Pulling schema from database" phase

tsx scripts/db-push-wrapper.ts
