import "reflect-metadata";
import {format} from "date-fns";
import DiscordJS, { MessageEmbed } from "discord.js";
import dotenv from "dotenv";
import path from "path";

import botCommands from "./commands";
import { database } from "./database";
import { BeerController } from "./controllers/BeerController";
import { UserController } from "./controllers/UserController";
import { User } from "./database/entities/User";
import { Beer } from "./database/entities/Beer";

const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

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
    // DISPARAR MENSAGEM DE BEM-VINDO
    const members = await guild.members.fetch();
    members.map(async (member) => {
      if(!member.user.bot) {
        await UserController.createOrFind({ user_id: member.user.id, guild_id: guild.id });
      };
    });
   });

   client.on("interactionCreate", async (interaction: any) => {
    if(!interaction.isCommand) { 
      return;
    };

    const { commandName, user, options, guildId, guild } = interaction;
    const commands = guild?.commands;
    for(let botCommand of botCommands) {
      commands?.create(botCommand);
    };

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
        const data = options.getString("data");
        const date = new Date(Date.now());

        if(data && data.match(/^((0[1-9])|(1[0-2]))\/((2009)|(20[1-2][0-9]))$/)) {
          date.setMonth(Number((data.split("/"))[0]) - 1);
          date.setFullYear(Number((data.split("/"))[1]));
        };

        const year = format(date, "yyyy");
        const month = format(date, "MM");
        const message = new MessageEmbed()
        .setTitle(`RANKING DOS CERVEJEIROS (${month}/${year})`.toUpperCase())
        .setDescription("o raking é ordenado pelo cervejeiro que mais tem brejas em sua conta.")
        .setColor("RANDOM");

        const users = await User.createQueryBuilder("user")
        .innerJoinAndSelect("user.beers", "beer", "beer.to_id = user.id")
        .where("EXTRACT(MONTH FROM beer.created_at) = :month", { month })
        .andWhere("EXTRACT(YEAR FROM beer.created_at) = :year", { year })
        .getMany();
        
        const ranking = users.sort((a, b) => b.beers.length - a.beers.length);
        for(let index = 0; index < ranking.length; index++) {
          const item = ranking[(index)];
          const totalOfBeers = item.beers.length;
          const balance = Intl.NumberFormat('pt-BR', { 
            style: "currency", 
            currency: 'BRL',
            minimumFractionDigits: 2,
          }).format(5 * totalOfBeers);

          message.addField(`${(index + 1)}º LUGAR`, `<@${item.id}> ${totalOfBeers} Brejas, Total ${balance}`);
        };
        
        return interaction.reply({ embeds: [message] });
      };

      case "punir": {
        try {
          const who = options.getUser("quem");
          const reason = options.getString("motivo");

          const beer = await Beer.createQueryBuilder("beer")
          .select()
          .innerJoinAndSelect("beer.toUser", "to", "to.id = :id", {id: who.id})
          .where("to.guild_id = :guildId", { guildId })
          .getOne();
          
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

          const balance = Intl.NumberFormat('pt-BR', { 
            style: "currency", 
            currency: 'BRL',
            minimumFractionDigits: 2,
          }).format(5 * beers.length);

          const message = new MessageEmbed()
          .setTitle(`HISTÓRICO DO CERVEJEIRO`)
          .setDescription(`histórico do cervejeiro <@${who.id}>`)
          .setColor('RANDOM')
          .addField("SALDO", balance, true)
          .addField("BREJAS", `${beers.length} breja(s)`, true)
          .addField("DATA", `${format(date, "MM/yyyy")}`, true);

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

      case "sobre": {
        const messageToSend = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Olá cervejeiro! :wave:")
        .setDescription("Sou o **BrejaBot**, um bot criado para automatizar o processo de premiação com cervejas...\nAqui está o perfil do meu criador caso deseje entrar em contato para sugestões de melhorias https://github.com/SirEliaas")
        .addField("/breja", "comando para dar uma breja geladinha como prêmio.")
        .addField("/ranking", "comando para mostrar o ranking dos cervejeiros.")
        .addField("/punir", "comando para punir um cervejeiro.")
        .addField("/historico", "visualizar o histórico de um cervejeiro.")

        return interaction.reply({
          embeds: [messageToSend],
          ephemeral: true,
        });
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
