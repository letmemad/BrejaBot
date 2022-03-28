import { Beer } from "../database/entities/Beer";
import { UserController } from "./UserController";

type CreateBeerDTO = {
  from_id: string;
  to_id: string;
  guild_id: string;
  motivo?: string;
};

export const BeerController = {
  async create({from_id, to_id, guild_id, motivo = "Não informado"}: CreateBeerDTO) {
    try {
      // CREATE OR FIND THE USERs
      const from = await UserController.createOrFind({ user_id: from_id, guild_id });
      const to = await UserController.createOrFind({ user_id: to_id, guild_id });

      const result = Beer.create({ from_id: from.id, to_id: to.id, motivo });
      await result.save();

      return result;
    } catch(error) {
      console.log(error);
      throw new Error(error.message);
    };
  },
};