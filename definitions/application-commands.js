// see: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
export const APPLICATION_COMMAND_TYPE = {
  CHAT_INPUT: 1,
  USER: 2,
  MESSAGE: 3,
}

// see: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
export const APPLICATION_COMMAND_OPTION_TYPE = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
  MENTIONABLE: 9,
  NUMBER: 10,
  ATTACHMENT: 11,
}
