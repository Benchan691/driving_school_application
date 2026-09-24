const { Sequelize } = require('sequelize');
// dotenv.config() removed - Docker handles environment variables via env_file

// Determine database type from environment
// Default to PostgreSQL for Docker setup
const isPostgreSQL = process.env.DB_PORT === '5432' || 
                     process.env.POSTGRES_DB || 
                     process.env.DATABASE_URL?.includes('postgresql') || 
                     process.env.DATABASE_URL?.includes('postgres') ||
                     process.env.NODE_ENV === 'development'; // Default to PostgreSQL in development
const dialect = isPostgreSQL ? 'postgres' : 'mysql';

// Use DATABASE_URL if available, otherwise use individual connection parameters
const sequelize = process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ''
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres', // Explicitly set dialect for PostgreSQL
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    })
  : new Sequelize(
      process.env.POSTGRES_DB || process.env.DB_NAME || 'driving_school',
      process.env.POSTGRES_USER || process.env.DB_USER || 'postgres',
      process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'Ss69966043!', // Default password for Docker
      {
        host: process.env.DB_HOST || 'postgres', // Default to 'postgres' for Docker service name
        port: process.env.DB_PORT || (isPostgreSQL ? 5432 : 3306),
        dialect: 'postgres', // Force PostgreSQL for Docker setup
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: true,
          freezeTableName: true
        }
      }
    );

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };