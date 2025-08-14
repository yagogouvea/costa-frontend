// Declarações padrão para componentes JS sem tipos
declare module '@/components/ui/dialog';
declare module '@/components/ui/input';
declare module '@/components/ui/select';

// Declaração com tipos para radio-group (mantida porque normalmente está em .js ou não tipada)
declare module '@/components/ui/radio-group' {
  import * as React from 'react';

  export const RadioGroup: React.FC<{
    value: string;
    onValueChange: (value: string) => void;
    className?: string;
    'aria-label'?: string;
    children?: React.ReactNode;
  }>;

  export const RadioGroupItem: React.FC<{
    value: string;
    id: string;
    className?: string;
  }>;
}
