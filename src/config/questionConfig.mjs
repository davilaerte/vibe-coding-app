export const QUESTION_ID = "Q1";

export const QUESTION_TEXT = `
Crie uma aplicação simples para organizar atividades de estudo de uma disciplina.

Na tela da aplicação deve existir, pelo menos:
- Uma área onde serão mostradas as atividades de estudo (em forma de lista, tabela ou cartões);
- Um formulário com campos, por exemplo:
  - Nome da disciplina;
  - Nome ou descrição da atividade;
  - Dia da semana ou data;
  - Duração estimada em horas;
- Um botão (por exemplo, "Adicionar atividade") ligado a esse formulário.

O funcionamento esperado é o seguinte:
- A pessoa preenche o formulário e clica no botão;
- A aplicação pega essas informações e acrescenta uma nova atividade na área onde as atividades aparecem na tela;
- A página não deve ser recarregada a cada clique; as atividades vão surgindo uma embaixo da outra, à medida que são adicionadas;
- Deve ser possível repetir esse processo para cadastrar várias atividades.
`.trim();

export const LEVELS = {
  A: "Nunca programei / quase nada",
  B: "Já tive alguma disciplina / mexi um pouco",
  C: "Programo com frequência / sou de Computação",
};
