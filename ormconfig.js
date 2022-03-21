module.exports = {
  type: "sqlite",
  database: String(process.env.DB_DATABASE),
  entities: [String(process.env.DB_ENTITIES_PATH)],
  migrations: [String(process.env.DB_MIGRATIONS_PATH)],
  cli: {
  entitiesDir: "src/database/entities",
  migrationsDir: "src/database/migrations",
  },
};