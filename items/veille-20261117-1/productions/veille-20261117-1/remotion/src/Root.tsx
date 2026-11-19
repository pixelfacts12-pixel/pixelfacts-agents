import {Composition} from 'remotion';
import {Enquete} from './Enquete';

export const Root = () => (
  <Composition id="Enquete" component={Enquete} durationInFrames={1420} fps={30} width={1080} height={1920} />
);
