// services/UsuarioService.js
const bcrypt = require('bcryptjs')
const Usuario = require('../models/Usuario')

function validarMinimoDeUmAdministrador(usuario) {
    if (!usuario?.ativo || usuario.admin !== 1) {
        return
    }

    const totalAdminsAtivos = Usuario.contarAdminsAtivos()
    if (totalAdminsAtivos <= 1) {
        throw new Error('O sistema deve ter no mínimo 1 administrador ativo')
    }
}

const UsuarioService = {
    async criar({ login, senha }) {
        if (!login || !senha) {
            throw new Error('Login e senha são obrigatórios')
        }

        // login único
        const loginExistente = Usuario.buscarPorLogin(login)
        if (loginExistente) {
            throw new Error('Já existe um usuário com esse login')
        }

        if (senha.length < 6) {
            throw new Error('A senha deve ter no mínimo 6 caracteres')
        }

        const senha_hash = await bcrypt.hash(senha, 10)
        const id = Usuario.criar({ login, senha_hash })

        return { mensagem: "Usuário criado com sucesso", id, login }
    },

    async verificarSenha(login, senha) {
        const usuario = Usuario.buscarPorLogin(login)

        if (!usuario) {
            throw new Error('Usuário ou senha inválidos')
        }

        if (!usuario.ativo) {
            throw new Error('Usuário inativo')
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash)

        if (!senhaCorreta) {
            throw new Error('Usuário ou senha inválidos')
        }

        return { id: usuario.id, login: usuario.login }
    },

    //Lógica para listar todos os usuários cadastrados e ativos
    listar() {
        const usuarios = Usuario.listar()
        return usuarios
    },

    //Lógica para desativar um usuário
    desativar(dados) {
        const id = typeof dados === 'object' && dados !== null ? dados.id : dados
        if (!id) {
            throw new Error('ID do usuário é obrigatório para desativação')
        }

        const usuario = Usuario.buscarPorId(id)
        if (!usuario || !usuario.ativo) {
            throw new Error('Nenhum usuário encontrado com o ID fornecido')
        }

        const totalUsuariosAtivos = Usuario.contarUsuariosAtivos()
        if (totalUsuariosAtivos <= 1) {
            throw new Error('Não é permitido desativar o único usuário ativo do sistema')
        }

        validarMinimoDeUmAdministrador(usuario)

        const usuariosDesativados = Usuario.desativar(id)
        if(usuariosDesativados === 0) {
            throw new Error('Nenhum usuário encontrado com o ID fornecido')
        }
        return { mensagem: "Usuário desativado com sucesso", id }
    },

    async alterarSenha({ id, senha }) {
        if (!id) {
            throw new Error('ID do usuário é obrigatório')
        }
        if (!senha || senha.length < 6) {
            throw new Error('A senha deve ter no mínimo 6 caracteres')
        }

        const senha_hash = await bcrypt.hash(senha, 10)
        const alterados = Usuario.alterarSenha({ id, senha_hash })
        if (alterados === 0) {
            throw new Error('Nenhum usuário ativo encontrado com o ID fornecido')
        }
        return { mensagem: 'Senha alterada com sucesso', id }
    },

    alterarPermissao({ id, admin }) {
        if (!id) {
            throw new Error('ID do usuário é obrigatório')
        }
        if (admin !== 0 && admin !== 1) {
            throw new Error('Valor de permissão inválido')
        }

        const usuario = Usuario.buscarPorId(id)
        if (!usuario || !usuario.ativo) {
            throw new Error('Nenhum usuário ativo encontrado com o ID fornecido')
        }

        if (usuario.admin === 1 && admin === 0) {
            validarMinimoDeUmAdministrador(usuario)
        }

        const alterados = Usuario.alterarPermissao({ id, admin })
        if (alterados === 0) {
            throw new Error('Nenhum usuário ativo encontrado com o ID fornecido')
        }

        const tipo = admin === 1 ? 'Administrador' : 'Usuário'
        return { mensagem: `Permissão alterada para ${tipo}`, id, admin }
    }
}

module.exports = UsuarioService