import "reflect-metadata";
import {format, getMonth, getYear, parseISO} from "date-fns";
import DiscordJS, { MessageEmbed } from "discord.js";
import dotenv from "dotenv";
import botCommands from "./commands";
import { database } from "./database";
import { BeerController } from "./controllers/BeerController";
import { UserController } from "./controllers/UserController";
import { User } from "./database/entities/User";
import { Beer } from "./database/entities/Beer";
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
      .addField("/punir", "comando para punir um cervejeiro.")
      .addField("/historico", "visualizar o histórico de um cervejeiro.")

      await channel.send({ embeds: [messageToSend] });

      const members = await guild.members.fetch();
      members.map(async (member) => {
        if(!member.user.bot) {
          await UserController.createOrFind({ user_id: member.user.id, guild_id: guild.id });
        };
      });
    };
   });

   client.on("interactionCreate", async (interaction: any) => {
    if(!interaction.isCommand) { return };

    const { commandName, user, options, guildId, guild } = interaction;
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
            motivo: motivo || "Não informado",
          });

          let message = new MessageEmbed()
          .setTitle(":beer: Breja geladinha!")
          .setDescription(`<@${user.id}> deu uma breja geladinha para <@${to.id}>`)
          .addField("MOTIVO", beer.motivo)
          .setColor("RANDOM");

          return interaction.reply({ embeds: [message] });
        } catch(error) {
          return interaction.reply({
            content: `ops, parece que estou com alguns problemas. [${error.message}]`,
            ephemeral: true,
          });
        };
      };

      case "ranking": {
        const message = new MessageEmbed()
        .setTitle("RANKING DOS CERVEJEIROS")
        .setDescription("o raking é ordenado pelo cervejeiro que mais tem brejas em sua conta.")
        .setColor("RANDOM");

        const users = await User.find({ where: { guild_id: guildId }, relations: ["beers"] });
        const ranking = users.sort((a, b) => b.beers.length - a.beers.length);
        for(let index = 0; index < ranking.length; index++) {
          const position = (index + 1);
          const item = ranking[(index)];

          message.addField(`${position}º LUGAR`, `<@${item.id}> COM TOTAL DE ${item.beers.length} BREJA(S)`);
        };
        
        return interaction.reply({ embeds: [message] });
      };

      case "punir": {
        try {
          const who = options.getUser("quem");
          const reason = options.getString("motivo");

          const beer = await Beer.findOne({ order: { created_at: "DESC" } });
          if(!beer) {
            return interaction.reply({
              content: `<@${user.id}> tentou punir o <@${who.id}> porém o cervejeiro está falido.`
            });
          };

          await Beer.update(beer.id, {
            disabled_at: `${(new Date()).toISOString()}`,
            disabled_by: user.id, 
            disabled_reason: reason || "Não informou o motivo"
          });

          const message = new MessageEmbed()
          .setTitle("CERVEJEIRO PUNIDO!")
          .setDescription(`<@${who.id}> foi punido pelo <@${user.id}>`)
          .addField("MOTIVO", reason || "Não informou o motivo")
          .setColor("RED");

          return interaction.reply({ embeds: [message] });
        } catch(error) {
          return interaction.reply({
            content: `Não foi possível punir o cervejeiro [${error.message}]`,
            ephemeral: true,
          });
        };
      };

      case "historico": {
        try {
          const who = options.getUser("quem") as DiscordJS.User;
          const data = options.getString("data") as String;
          const date = new Date();

          if(data && data.match(/^((0[1-9])|(1[0-2]))\/((2009)|(20[1-2][0-9]))$/)) {
            date.setMonth(Number((data.split("/"))[0]) - 1);
            date.setFullYear(Number((data.split("/"))[1]));
          };

          const beers = await Beer.createQueryBuilder("beer")
          .select()
          .orderBy("beer.created_at", "DESC")
          .innerJoin("user", "user", "beer.to_id = user.id")
          .where("beer.to_id = :userId", { userId: who.id })
          .andWhere("user.guild_id = :guildId", { guildId })
          .andWhere("EXTRACT(MONTH FROM beer.created_at) = :month", { month: format(date, "MM") })
          .andWhere("EXTRACT(YEAR FROM beer.created_at) = :year", { year: format(date, "yyyy") })
          .getMany();

          const message = new MessageEmbed()
          .setTitle(`HISTÓRICO DO CERVEJEIRO`)
          .setDescription(`histórico do cervejeiro <@${who.id}>`)
          .setColor('RANDOM')
          .addField("TOTAL", `${beers.length} breja(s)`, true)
          .addField("DATA", `${format(date, "MM/yyyy")}`, true)

          for(let beer of beers) {
            message.addField(`${format(beer.created_at, "dd/MM/yyyy")}`,
            `<@${beer.from_id}> > ${beer.motivo}`, false);
          };

          return interaction.reply({ embeds: [message] });
        } catch(error) {
          return interaction.reply({
            content: `Não foi possível consultar o cervejeiro. [${error.message}]`,
            ephemeral: true,
          });
        };
      };

      default: { return };
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