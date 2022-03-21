module.exports = {
  type: "sqlite",
  database: "src/database/database.db",
  entities: ["src/database/entities/*.{js,ts}"],
  migrations: ["src/database/migrations/*.{js,ts}"],
  cli: {
  entitiesDir: "src/database/entities",
  migrationsDir: "src/database/migrations",
  },
};