import { Button } from '../../components/Button/Button';
import { useAuthStore } from '../../store/authStore';

/**
 * Заглушка Этапа 1.2 — существует только чтобы проверить сквозной сценарий
 * "вход -> защищённая страница -> выход" через реальный интерфейс.
 * Layout (Sidebar/Navbar) и реальный контент Dashboard — Этап 1.4.
 */
export function Dashboard(): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-0 px-4">
      <p className="text-lg text-ink-900">
        Добро пожаловать, {user?.firstName} {user?.lastName} ({user?.role})
      </p>
      <Button variant="secondary" onClick={() => void logout()}>
        Выйти
      </Button>
    </main>
  );
}
