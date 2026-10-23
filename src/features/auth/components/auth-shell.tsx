import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { InteractiveGridPattern } from './interactive-grid';

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full flex-col p-10 lg:flex dark:border-r'>
        <div className='bg-sidebar absolute inset-0' />
        <div className='text-sidebar-foreground relative z-20 flex items-center text-lg font-medium'>
          <Icons.logo className='mr-2 h-6 w-6' />
          SLC Polri
        </div>
        <InteractiveGridPattern
          className={cn(
            'mask-[radial-gradient(400px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[0%] h-full skew-y-12'
          )}
        />
        <div className='text-sidebar-foreground relative z-20 mt-auto'>
          <p className='text-lg'>Dashboard internal SLC Polri.</p>
          <p className='text-sidebar-foreground/70 text-sm'>
            Akses hanya untuk personel yang berwenang.
          </p>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-sm flex-col justify-center space-y-6'>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
