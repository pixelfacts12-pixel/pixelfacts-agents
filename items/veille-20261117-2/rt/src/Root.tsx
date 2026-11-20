import {Composition} from 'remotion';
import {Video} from './Video';
export const Root = () => (
  <Composition id="Video" component={Video} durationInFrames={1110} fps={30} width={1080} height={1920} />
);
