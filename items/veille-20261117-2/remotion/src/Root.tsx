import {Composition} from 'remotion';
import {Video} from './Video';
import {END} from './beats';
export const Root = () => (
  <Composition id="Video" component={Video} durationInFrames={Math.round(END * 30)} fps={30} width={1080} height={1920} />
);
