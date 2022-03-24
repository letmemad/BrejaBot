import "reflect-metadata";
import DiscordJS, { MessageEmbed } from "discord.js";
import dotenv from "dotenv";
import botCommands from "./commands";
import { database } from "./database";
import { BeerController } from "./controllers/BeerController";
import { UserController } from "./controllers/UserController";
dotenv.config();

const client = new DiscordJS.Client({
  intents: [
    "GUILDS",
    "GUILD_EMOJIS_AND_STICKERS",
    "GUILD_MESSAGE_REACTIONS",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
  ],
});

client.on("ready", async () => {
   client.on("guildCreate", async (guild) => {
    const commands = guild?.commands;

    // ADICIONAR NOVOS COMANDOS
    for(let botCommand of botCommands) {
      commands?.create(botCommand);
    };

    // DISPARAR MENSAGEM DE BEM-VINDO
    const mainChannelNames = ["geral", "general", "main"];
    const channel = guild.channels.cache.find(value => mainChannelNames.includes(value.name));
    if(channel && channel.isText()) {
      const messageToSend = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle("Olá cervejeiros! :wave:")
      .setDescription("Sou o **BrejaBot**, um bot criado para automatizar o processo de premiação com cervejas... Até porque todos aqui gostam de uma cerveja geladinha né ?! :beers:")
      .addField("/breja", "comando para dar uma breja geladinha como prêmio.")
      .addField("/ranking", "comando para mostrar o ranking dos cervejeiros.")

      await channel.send({ embeds: [messageToSend] });

      const members = await guild.members.fetch();
      members.map(async (member) => {
        await UserController.createOrFind({ user_id: member.user.id, guild_id: guild.id });
      });
    };
   });

   client.on("interactionCreate", async (interaction: any) => {
    if(!interaction.isCommand) { return };

    const { commandName, user, options, guildId } = interaction;
    switch(commandName) {
      case "breja": {
        const to = options.getUser("para");
        if(user.id === to.id) {
          return interaction.reply({
            content: `<@${user.id}> tentou dar uma breja para ele mesmo, pode isso Arnaldo ?!`
          });
        };

        try {
          const motivo = options.getString("motivo");
          const beer = await BeerController.create({ 
            to_id: to.id, 
            from_id: user.id,
            guild_id: guildId, 
            motivo,
          });

          let message = new MessageEmbed()
          .setTitle(":beer: Breja geladinha!")
          .setDescription(`<@${user.id}> deu uma breja geladinha para <@${to.id}>`)
          .addField("MOTIVO", beer.motivo)
          .setColor("RANDOM");

          return interaction.reply({ embeds: [message] });
        } catch(error) {
          return interaction.reply({
            content: "ops, parece que estou com alguns problemas.",
            ephemeral: true,
          });
        };
      };

      case "ranking": {
        break;
      };

      case "info": {
      };

      default: {

      };
    };
  });
});

client.login(process.env.DISCORD_TOKEN).then(async () => {
  console.log("[BREJABOT] -> LOGGED IN!");
  const connection = await database.initConnection();
  await connection.runMigrations();
}).catch((error) => {
  console.log("[BREJABOT] -> LOGIN ERROR: " + error.message);
});