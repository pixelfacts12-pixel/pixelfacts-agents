import {Composition} from 'remotion';
import {Pirate} from './Pirate';

export const Root = () => (
  <Composition id="Pirate" component={Pirate} durationInFrames={1300} fps={30} width={1080} height={1920} />
);
