import 'dotenv/config';
import { APPLICATION_COMMAND_TYPE, APPLICATION_COMMAND_OPTION_TYPE } from './definitions/application-commands.js';
import { InstallGlobalCommands } from './lib/utils.js';

const TRIVIA_COMMAND = {
  name: 'trivia',
  description: 'Play this trivia to learn facts about veganism and prepare for debates!',
  type: APPLICATION_COMMAND_TYPE.CHAT_INPUT,
};

const RECIPES_COMMAND = {
  name: 'recipes',
  description: 'Find out what other people like to cook/bake!',
  type: APPLICATION_COMMAND_TYPE.CHAT_INPUT,
};

const IMPACT_COMMAND = {
  name: 'impact',
  description: 'Discover the impact of going vegan!',
  type: APPLICATION_COMMAND_TYPE.CHAT_INPUT,
  options: [
    {
      type: APPLICATION_COMMAND_OPTION_TYPE.STRING,
      name: 'of',
      description: 'see impact of server or yourself',
      choices: [
        {
          name: 'server',
          value: 'server',
        },
        {
          name: 'self',
          value: 'self',
        }
      ]
    }
  ]
}

const ALL_COMMANDS = [TRIVIA_COMMAND, RECIPES_COMMAND, IMPACT_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
