import {Composition} from 'remotion';
import {Splash} from './Splash';

export const Root = () => (
  <Composition id="Splash" component={Splash} durationInFrames={810} fps={30} width={1080} height={1920} />
);
