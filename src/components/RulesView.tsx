import { Eye, Shield, Sparkles, Volume2 } from 'lucide-react';

export function RulesView() {
  const stages = [
    {
      step: '1ª Dica',
      title: 'Som, Região, Forma Regional e Medidas',
      points: '100 pontos',
      desc: 'Cada rodada inicia com o cry original do Pokémon, sua região de origem, indicação de forma regional, altura e peso.',
      icon: Volume2,
    },
    {
      step: '2ª Dica',
      title: 'Dois Ataques Compatíveis',
      points: '75 pontos',
      desc: 'Ao errar a primeira tentativa, são revelados 2 golpes oficiais que aquele Pokémon aprende nos jogos.',
      icon: Sparkles,
    },
    {
      step: '3ª Dica',
      title: 'Tipagens Oficiais',
      points: '50 pontos',
      desc: 'Ao errar pela segunda vez, os tipos do Pokémon (ex: Fogo / Voador) aparecem com seus ícones.',
      icon: Shield,
    },
    {
      step: '4ª Dica',
      title: 'Silhueta Completa',
      points: '25 pontos',
      desc: 'No terceiro erro, a silhueta preta oficial do Pokémon é revelada no centro da arena para sua última chance.',
      icon: Eye,
    },
  ];

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Regras e Pontuação
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Descubra Pokémon das gerações 1 a 9 (incluindo formas de Alola, Galar, Hisui e Paldea) usando o menor número possível de dicas.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stages.map(({ step, title, points, desc, icon: Icon }) => (
          <div
            key={step}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-[#1D4ED8]">
                <Icon className="h-4 w-4" />
                {step}
              </span>
              <span className="font-mono-tabular text-xs font-bold text-[#E3350D]">
                {points}
              </span>
            </div>
            <h2 className="mt-2 font-display text-lg font-bold text-slate-900">
              {title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Modos e Dificuldades
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm text-slate-600">
          <div>
            <h3 className="font-bold text-slate-900">Modos de Jogo e Dicas</h3>
            <ul className="mt-2 space-y-1.5">
              <li>
                <span className="font-semibold text-slate-800">Modo Clássico:</span>{' '}
                10 rodadas por partida, sem repetição de Pokémon.
              </li>
              <li>
                <span className="font-semibold text-slate-800">Modo Infinito:</span>{' '}
                Rodadas contínuas até você decidir encerrar e conferir seu resumo.
              </li>
              <li>
                <span className="font-semibold text-slate-800">Modo Personalizado:</span>{' '}
                Escolha quantas rodadas, quantas chances, quais dicas começam abertas, o que libera em cada erro e quais gerações jogar.
              </li>
              <li>
                <span className="font-semibold text-slate-800">Escolher Dica (-1 tentativa):</span>{' '}
                Você pode revelar qualquer dica bloqueada a qualquer momento (exceto na última chance), gastando 1 tentativa.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Níveis de Dificuldade</h3>
            <ul className="mt-2 space-y-1.5">
              <li>
                <span className="font-semibold text-slate-800">Fácil:</span>{' '}
                4 opções de múltipla escolha além do campo de texto.
              </li>
              <li>
                <span className="font-semibold text-slate-800">Normal:</span>{' '}
                Campo com sugestões inteligentes em português e inglês.
              </li>
              <li>
                <span className="font-semibold text-slate-800">Difícil:</span>{' '}
                Digitação pura sem sugestões (acentos e maiúsculas são ignorados).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
