import React from 'react'
import TabelaCliente from "../components/cliente/TabelaCliente";

const listaCliente = [
    {
        id: 1,
        nome: "João Silva",
        cpf: "123.456.789-00",
        telefone: "(37) 99999-9999",
        email: "joao@gmail.com",
        codigoDaCota: "A15",
        categoria: "Sócio"
    },
    {
        id: 2,
        nome: "Maria Souza",
        cpf: "987.654.321-00",
        telefone: "(37) 98888-8888",
        email: "maria@gmail.com",
        codigoDaCota: "B08",
        categoria: "Visitante"
    }
];


const Clientes = function Clientes() {

  return (
    <>
       <TabelaCliente/>
    </>
    
)





}

export default Clientes