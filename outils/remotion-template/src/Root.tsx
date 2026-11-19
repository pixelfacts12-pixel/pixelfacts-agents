import {Composition} from 'remotion';
import {Titre} from './Titre';

export const Root = () => (
  <>
    {/* 16:9 YouTube */}
    <Composition id="Titre" component={Titre} durationInFrames={90} fps={30} width={1920} height={1080}
      defaultProps={{texte: 'DÉFI : 24H SUR LE MÊME JEU', couleur: '#ffcc00'}} />
    {/* 9:16 Shorts / TikTok */}
    <Composition id="TitreVertical" component={Titre} durationInFrames={90} fps={30} width={1080} height={1920}
      defaultProps={{texte: 'TOP 1 EN CUP', couleur: '#00e5ff'}} />
  </>
);
