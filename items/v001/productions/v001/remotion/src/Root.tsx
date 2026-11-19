import {Composition} from 'remotion';
import {RobloxCode} from './RobloxCode';
import {TOTAL_DURATION_S} from './segments';

export const Root = () => (
  <>
    <Composition
      id="RobloxCode"
      component={RobloxCode}
      durationInFrames={TOTAL_DURATION_S * 30}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
