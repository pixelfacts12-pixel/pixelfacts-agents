import {Composition} from 'remotion';
import {RobRun} from './RobRun';
import {TOTAL} from './beats';

export const Root = () => (
  <Composition id="RobRun" component={RobRun} durationInFrames={Math.ceil(TOTAL * 30) + 6} fps={30} width={1080} height={1920} />
);
