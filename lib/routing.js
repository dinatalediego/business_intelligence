function normalize(value) {
  return value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function findClosestScenario(question, scenarios) {
  const normalizedQuestion = normalize(question);
  let best = scenarios[0];
  let bestScore = -1;

  scenarios.forEach((scenario) => {
    const score = scenario.keywords.reduce(
      (total, keyword) => total + (normalizedQuestion.includes(normalize(keyword)) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      best = scenario;
      bestScore = score;
    }
  });

  return best;
}
