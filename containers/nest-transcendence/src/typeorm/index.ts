import { User } from '../user/user.entities';
import { Channel } from '../channel/channel.entities';
import { GameStat } from '../game/game.entities.ts'

const entities = [User, Channel, GameStat];

export { User, Channel, GameStat };
export default entities;
