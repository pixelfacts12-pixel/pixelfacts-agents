import {Composition} from 'remotion';
import {Video} from './Video';
import {TOTAL} from './beats';

export const Root = () => (
  <Composition id="Video" component={Video} durationInFrames={Math.ceil(TOTAL * 30) + 6} fps={30} width={1080} height={1920} />
);
