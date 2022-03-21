import { GuildMember } from "discord.js";
import { Beer } from "../database/entities/Beer";

export const GuildMemberController = {
  async onAvailable(member: GuildMember) {
    try {
      const userId = member.user.id;
      if((!member.user.bot) && !await Beer.findOne({ where: { to_id: userId } })) {
        const beer = Beer.create({ to_id: userId, quantity: 0 });
        await beer.save();
      };
    } catch(error) {
      throw new Error(error);
    };
  },

  async onRemove(member: GuildMember) {
    try {
      const userId = member.user.id;
      await Beer.createQueryBuilder()
      .delete()
      .where("to_id = :userId", {userId})
      .execute();
    } catch(error) {
      throw new Error(error);
    };
  },
}