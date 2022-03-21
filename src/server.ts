import "reflect-metadata";
import DiscordJS, { GuildMember } from "discord.js";
import dotenv from "dotenv";
import botCommands from "./commands";
import { database } from "./database";
import { InteractionController } from "./controllers/InteractionController";
import { GuildMemberController } from "./controllers/GuildController";
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
    for(let botCommand of botCommands) {
      commands?.create(botCommand);
    };

    (await guild.members.list()).each((member) => GuildMemberController.onAvailable(member));
    client.on("guildMemberAdd", (member: GuildMember) => GuildMemberController.onAvailable(member));
    client.on("guildMemberRemove", (member: GuildMember) => GuildMemberController.onRemove(member));
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

      default: { return }
    };
  });
});

client.login(process.env.DISCORD_TOKEN).then(async () => {
  console.log("[LIMMY] -> LOGGED IN!");
  await database.initConnection();
}).catch((error) => {
  throw new Error("[LIMMY] -> LOGIN ERROR: " + error.message);
});