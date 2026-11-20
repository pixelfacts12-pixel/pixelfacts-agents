import {Composition} from 'remotion';
import {Video, TOTAL} from './Video';
export const Root = () => (
  <Composition id="RobRun" component={Video} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
