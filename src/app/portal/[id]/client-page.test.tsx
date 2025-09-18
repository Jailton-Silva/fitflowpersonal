
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PortalClientPage from './client-page'; // Ajuste o caminho conforme necessário

// Mock da função fetch
global.fetch = jest.fn();

// Mock do useToast para evitar erros
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockStudent = {
  id: '1',
  name: 'Aluno Teste',
  avatar_url: '',
  access_password: 'senha123',
};

const mockWorkouts = [
  {
    id: 'w1',
    name: 'Treino A',
    description: 'Descrição do Treino A',
    exercises: [],
    access_password: null,
  },
];

describe('PortalClientPage', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('deve exibir o formulário de senha se o aluno tiver uma senha de acesso', () => {
    render(<PortalClientPage student={mockStudent} initialWorkouts={mockWorkouts} />);
    expect(screen.getByText('Portal Protegido')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha de acesso do portal')).toBeInTheDocument();
  });

  it('deve autenticar e exibir os treinos ao submeter a senha correta', async () => {
    // Mock da resposta da API para sucesso
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<PortalClientPage student={mockStudent} initialWorkouts={mockWorkouts} />);

    // Simula a digitação da senha e o envio
    fireEvent.change(screen.getByPlaceholderText('Senha de acesso do portal'), {
      target: { value: 'senha123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Desbloquear/i }));

    // Aguarda a autenticação e a renderização do conteúdo
    await waitFor(() => {
      expect(screen.getByText('Acesso Liberado')).toBeInTheDocument();
    });

    expect(screen.getByText('Seus treinos disponíveis:')).toBeInTheDocument();
    expect(screen.getByText('Treino A')).toBeInTheDocument();
  });

  it('deve exibir uma mensagem de erro ao submeter a senha incorreta', async () => {
    // Mock da resposta da API para falha
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Senha do portal incorreta.' }),
    });

    render(<PortalClientPage student={mockStudent} initialWorkouts={mockWorkouts} />);

    fireEvent.change(screen.getByPlaceholderText('Senha de acesso do portal'), {
      target: { value: 'senha-errada' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Desbloquear/i }));

    await waitFor(() => {
      // O toast seria o lugar ideal para verificar, mas como mockamos, 
      // vamos garantir que o portal não foi liberado
      expect(screen.queryByText('Acesso Liberado')).not.toBeInTheDocument();
    });
  });

  it('não deve exibir o formulário de senha se o aluno não tiver senha', () => {
    const studentWithoutPassword = { ...mockStudent, access_password: null };
    render(<PortalClientPage student={studentWithoutPassword} initialWorkouts={mockWorkouts} />);
    
    expect(screen.getByText('Acesso Liberado')).toBeInTheDocument();
    expect(screen.queryByText('Portal Protegido')).not.toBeInTheDocument();
  });

});
