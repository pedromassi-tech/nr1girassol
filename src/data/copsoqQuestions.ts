
export interface CopsoqQuestion {
  id: number;
  question: string;
  block: string;
}

export const copsoqQuestions: CopsoqQuestion[] = [
  // Bloco A – Exigências e organização do trabalho
  { id: 1, block: "Exigências e organização do trabalho", question: "A carga de trabalho na sua empresa se acumula por ser mal distribuída entre as pessoas?" },
  { id: 2, block: "Exigências e organização do trabalho", question: "Com que frequência as pessoas não têm tempo suficiente para completar todas as tarefas?" },
  { id: 3, block: "Exigências e organização do trabalho", question: "As equipes precisam trabalhar muito rapidamente para dar conta das demandas?" },
  { id: 4, block: "Exigências e organização do trabalho", question: "O trabalho exige atenção constante, com pouca margem para pausas ou recuperação?" },
  
  // Bloco B – Influência, clareza e justiça
  { id: 5, block: "Influência, clareza e justiça", question: "As pessoas têm influência real sobre como organizam o próprio trabalho e prioridades?" },
  { id: 6, block: "Influência, clareza e justiça", question: "As responsabilidades e expectativas de cada função estão claramente definidas?" },
  { id: 7, block: "Influência, clareza e justiça", question: "As pessoas recebem, com antecedência, informações importantes sobre mudanças e decisões?" },
  { id: 8, block: "Influência, clareza e justiça", question: "O trabalho é reconhecido e valorizado pela liderança quando é bem feito?" },
  { id: 9, block: "Influência, clareza e justiça", question: "As decisões da liderança são percebidas como justas e coerentes no dia a dia?" },
  
  // Bloco C – Apoio social e liderança
  { id: 10, block: "Apoio social e liderança", question: "Existe um bom clima de cooperação entre os membros das equipes?" },
  { id: 11, block: "Apoio social e liderança", question: "As pessoas sentem que podem pedir ajuda aos colegas quando precisam?" },
  { id: 12, block: "Apoio social e liderança", question: "As pessoas sentem que podem pedir ajuda e orientação à liderança quando precisam?" },
  { id: 13, block: "Apoio social e liderança", question: "A liderança conversa com frequência sobre como o trabalho está sendo feito, dando feedback?" },
  { id: 14, block: "Apoio social e liderança", question: "A liderança é percebida como preparada para lidar com conflitos e situações difíceis?" },
  
  // Bloco D – Significado, comprometimento e segurança psicológica
  { id: 15, block: "Significado, comprometimento e segurança psicológica", question: "As pessoas sentem que o trabalho que fazem tem significado e importância real?" },
  { id: 16, block: "Significado, comprometimento e segurança psicológica", question: "As pessoas se sentem motivadas e envolvidas com o trabalho da empresa?" },
  { id: 17, block: "Significado, comprometimento e segurança psicológica", question: "As pessoas sentem que podem falar sobre problemas e erros sem medo de punição injusta?" },
  { id: 18, block: "Significado, comprometimento e segurança psicológica", question: "As pessoas confiam que a empresa vai tratar conflitos e denúncias com seriedade e respeito?" },
  { id: 19, block: "Significado, comprometimento e segurança psicológica", question: "As pessoas sentem que pertencem a uma comunidade no trabalho (não estão “cada um por si”)? " },
  { id: 20, block: "Significado, comprometimento e segurança psicológica", question: "Em geral, as pessoas estão satisfeitas com o trabalho que realizam na empresa?" },
];

export const copsoqScale = [
  { value: 1, label: "Nunca / Quase nunca" },
  { value: 2, label: "Raramente" },
  { value: 3, label: "Às vezes" },
  { value: 4, label: "Frequentemente" },
  { value: 5, label: "Sempre" },
];

export function calculateCopsoqScore(answers: number[]) {
  const sum = answers.reduce((a, b) => a + b, 0);
  const avg = sum / answers.length;
  const score = Math.round(((avg - 1) / 4) * 100);
  
  let level = "";
  let text = "";
  
  if (score <= 33) {
    level = "Reputação Fragilizada";
    text = "Sua empresa apresenta sinais fortes de fragilidade na relação entre pessoas, liderança e organização do trabalho. As respostas indicam pouca segurança psicológica, clima de cooperação instável e decisões que nem sempre são percebidas como justas ou claras. Esse cenário aumenta o risco de conflitos, adoecimento, rotatividade e impacto negativo na imagem da empresa, especialmente em um contexto em que a NR-1 passa a olhar para fatores psicossociais de forma estruturada.";
  } else if (score <= 66) {
    level = "Reputação em Alerta";
    text = "Sua empresa tem pontos positivos na forma de se relacionar com as pessoas, mas também sinais claros de alerta. Há aspectos de liderança, organização do trabalho ou segurança psicológica que podem estar gerando desgaste silencioso, perda de engajamento e ruídos internos que, se não forem tratados, tendem a aparecer em afastamentos, conflitos e perda de talento. Este é o momento ideal para fortalecer a governança de riscos psicossociais, antes que o quadro se torne crítico.";
  } else {
    level = "Reputação Sólida";
    text = "Sua empresa apresenta uma base saudável de relações, liderança e organização do trabalho. As pessoas tendem a perceber sentido no trabalho, apoio da liderança e um ambiente onde é possível falar sobre problemas com segurança. O desafio agora é consolidar essa base como parte da governança NR-1, gerando evidências consistentes para auditoria e sustentando essa reputação também em momentos de crise ou crescimento acelerado.";
  }
  
  return { score, level, text };
}
