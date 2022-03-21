import "reflect-metadata";
import DiscordJS, { GuildMember, MessageEmbed } from "discord.js";
import dotenv from "dotenv";
import botCommands from "./commands";
import { database } from "./database";
import { InteractionController } from "./controllers/InteractionController";
import { GuildMemberController } from "./controllers/GuildController";
import whitelist from "./commands/whitelist";
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

    // ADICIONAR LISTENER PARA QUANDO ADICIONAR OU REMOVER UM MEMBRO DO SERVER
    client.on("guildMemberAdd", (member: GuildMember) => GuildMemberController.onAvailable(member));
    client.on("guildMemberRemove", (member: GuildMember) => GuildMemberController.onRemove(member));

    // ADICIONAR TODOS OS MEMBROS DO SERVIDOR NO BANCO
    const members = await guild.members.list();
    members.each((member) => GuildMemberController.onAvailable(member));

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
    };
   });

   client.on("interactionCreate", (interaction: any) => {
    if(!interaction.isCommand) { return };

    const { commandName } = interaction;
    switch(commandName) {
      case "breja": {
        return InteractionController.onGiveBeer(interaction);
      };

      case "ranking": {
        return InteractionController.viewRanking(interaction);
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