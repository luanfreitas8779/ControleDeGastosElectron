// Estado simples de sessão (usuário logado) no processo principal.
// Mantido fora do main.js para evitar dependência circular entre controllers <-> main.

let sessaoAtual = null

const getSessao = () => sessaoAtual
const setSessao = (usuario) => {
  sessaoAtual = usuario
}

module.exports = { getSessao, setSessao }
