import * as typeorm from "typeorm";
export const database = {
  initConnection: async () => {
    try {
      const connection = await typeorm.createConnection();
      return connection;
    } catch(error) {
      throw new Error(error.message);
    };
  },
};