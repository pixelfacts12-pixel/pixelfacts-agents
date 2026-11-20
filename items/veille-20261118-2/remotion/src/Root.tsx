import {Composition} from 'remotion';
import {Record} from './Record';
import {TOTAL} from './beats';

export const Root = () => (
  <Composition id="Record" component={Record} durationInFrames={Math.ceil(TOTAL * 30) + 6} fps={30} width={1080} height={1920} />
);
