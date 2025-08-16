import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-6 mt-8 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Seu App de Treinos. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/terms-and-conditions" className="text-sm text-gray-600 hover:underline">
              Termos de Uso
            </Link>
            <Link href="/privacy-policy" className="text-sm text-gray-600 hover:underline">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
