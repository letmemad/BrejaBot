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
  }] as Array<ApplicationCommandDataResolvable>;;