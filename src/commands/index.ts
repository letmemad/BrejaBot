import { format } from "date-fns";
import { ApplicationCommandDataResolvable, Constants } from "discord.js";

export default [{
    name: "breja",
    description: "dê aquela breja geladinha para um amigo especial",
    options: [{ 
      name: "para", 
      description: "para quem vai essa breja.",
      type: Constants.ApplicationCommandOptionTypes.USER,
      required: true,
    }, {
      name: "motivo",
      description: "motivo dessa grande premiação",
      type: Constants.ApplicationCommandOptionTypes.STRING,
      required: false,
    }]
  }, {
    name: "ranking",
    description: "visualize o ranking de brejas",
    options: [{
      name: "data",
      description: `exemplo: ${format(new Date(), "MM/yyyy")}`,
      type: Constants.ApplicationCommandOptionTypes.STRING,
      required: false,
    }]
  }, {
    name: "punir",
    description: "punir um cervejeiro",
    options: [{
      name: "quem",
      description: "qual cervejeiro vai ser punido",
      type: Constants.ApplicationCommandOptionTypes.USER,
      required: true,
    }, {
      name: "motivo",
      description: "por qual motivo o cervejeiro está sendo punido",
      type: Constants.ApplicationCommandOptionTypes.STRING,
      required: false,
    }]
  }, {
    name: "historico",
    description: "conferir o histórico de um cervejeiro.",
    options: [{
      name: "quem",
      description: "qual cervejeiro você deseja consultar o histórico",
      type: Constants.ApplicationCommandOptionTypes.USER,
      required: true,
    }, {
      name: "data",
      description: `exemplo: ${format(new Date(), "MM/yyyy")}`,
      type: Constants.ApplicationCommandOptionTypes.STRING,
      required: false,
    }]
  }, {
    name: "sobre",
    description: "sobre mim e meus comandos."
  }] as Array<ApplicationCommandDataResolvable>;;