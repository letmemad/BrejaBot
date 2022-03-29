import { User } from "../database/entities/User";

type CreateUserDTO = {
  user_id: string;
  guild_id: string;
};

export const UserController = {
  async createOrFind({user_id, guild_id}: CreateUserDTO) {
    try {
      const user = await User.findOne({ where: { id: user_id, guild_id } });
      if(user) { 
        return user;
      };

      const result = User.create({ id: user_id, guild_id });
      await result.save();
      
      return result;
    } catch(error) {
      throw new Error(error.message);
    };
  },
};