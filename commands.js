import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

const TRIVIA_COMMAND = {
  name: 'trivia',
  description: 'Play this trivia to learn facts about veganism! This is great to prepare you for debates/conversations with people curious about veganism!',
  type: 1,
};

const RECIPES_COMMAND = {
  name: 'recipes',
  description: 'Find out what other people like to cook/bake!',
  type: 1,
};

const IMPACT_COMMAND = {
  name: 'impact',
  description: 'Discover the impact of going vegan!',
  type: 1,
}

const ALL_COMMANDS = [TRIVIA_COMMAND, RECIPES_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
