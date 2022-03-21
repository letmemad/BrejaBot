import { Interaction, User, MessageEmbed } from "discord.js";
import { Beer } from "../database/entities/Beer";
export interface InteractionPayload extends Interaction {
  options: any;
  reply(options: any): any;
};

export const InteractionController = {
  async onGiveBeer(interaction: InteractionPayload) {
    try {
      const { options, user } = interaction;

      const to = options.getUser("para") as User;
      if(to.id === user.id) {
        return interaction.reply({ 
          content: `<@${user.id}> tentou dar uma breja para ele mesmo! Pode isso Arnaldo ?!`, 
        });
      };
      
      const motivo = options.getString("motivo");
      const beer = await Beer.findOne({ where: { to_id: to.id } });
      if(!beer) {
        const result = Beer.create({ to_id: to.id, from_id: user.id, quantity: 1 });
        await result.save();
      } else {
        await Beer.update(beer.id, { quantity: (beer.quantity + 1) });
      };

      const message = new MessageEmbed()
      .setColor("AQUA")
      .setTitle(`:beers: BREJA GELADINHA`)
      .setThumbnail("https://cdn-icons-png.flaticon.com/32/3600/3600389.png")
      .setDescription(`<@${user.id}> deu uma breja geladinha para <@${to.id}>`)
      .addField("MOTIVO", motivo ? motivo : "Não informou o motivo.");

      return interaction.reply({embeds: [message]});
    } catch(error) {
      return interaction.reply({
        content: "ops, ocorreu um erro no meu servidor e não foi possível concluir a ação.",
        ephemeral: true
      });
    };
  },

  async viewRanking(interaction: InteractionPayload) {
    try {
      const beers = await Beer.find({ order: { quantity: "DESC" } });
      let message = new MessageEmbed()
      .setColor("GOLD")
      .setTitle(":trophy: RANKING DE BREJAS")
      .setDescription("confira o ranking de quem tem mais brejas na conta.");
      for(let index = 0; index < beers.length; index++) {
        const position = (index + 1);
        const item = beers[(index)];
        message.addField(`${position}º LUGAR`, `<@${item.to_id}> COM TOTAL DE ${item.quantity} BREJA(S) \n`);
      };

      return interaction.reply({ embeds: [message] });
    } catch(error) {
      console.log(error);
      return interaction.reply({
        content: "ops, ocorreu um erro no meu servidor e não foi possível concluir a ação.",
        ephemeral: true
      });
    };
  },
};