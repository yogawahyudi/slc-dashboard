'use client';

import { useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Field, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/** `value: null` is the "Semua …" option shown when nothing is selected. */
export type FilterOption = {
  value: string | null;
  label: string;
  icon?: keyof typeof Icons;
};

// cmdk needs a string value per item
const ALL_VALUE = '__semua__';

function OptionLabel({ option }: { option: FilterOption }) {
  const Icon = option.icon ? Icons[option.icon] : null;
  return (
    <>
      {Icon && <Icon className='text-muted-foreground' />}
      <span className='truncate'>{option.label}</span>
    </>
  );
}

/** Searchable select — Popover + Command, like ComboboxField but not tied to a form. */
export function FilterSelect({
  id,
  label,
  value,
  options,
  onValueChange,
  disabled,
  className
}: {
  id: string;
  label: string;
  value: string | null;
  options: FilterOption[];
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected =
    options.find((option) => option.value === value) ??
    options.find((option) => option.value === null);
  const listboxId = `${id}-listbox`;

  return (
    <Field className={cn('min-w-48 flex-1', className)} data-disabled={disabled}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant='outline'
              role='combobox'
              aria-controls={listboxId}
              aria-expanded={open}
              disabled={disabled}
              // contain:inline-size — a long label (e.g. a post caption) must not widen
              // the page on phones; the button takes its column's width and truncates
              className={cn(
                'w-full min-w-0 justify-between font-normal [contain:inline-size]',
                selected?.value === null && 'text-muted-foreground'
              )}
            />
          }
        >
          <span className='flex min-w-0 items-center gap-1.5'>
            {selected && <OptionLabel option={selected} />}
          </span>
          <Icons.chevronsUpDown className='text-muted-foreground shrink-0' />
        </PopoverTrigger>
        <PopoverContent align='start' className='w-(--anchor-width) min-w-64 p-0'>
          {/* Open with the current choice highlighted instead of the first item */}
          <Command defaultValue={selected?.value ?? ALL_VALUE}>
            <CommandInput placeholder={`Cari ${label.toLowerCase()}…`} />
            <CommandList id={listboxId}>
              <CommandEmpty>Tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value ?? ALL_VALUE}
                    value={option.value ?? ALL_VALUE}
                    keywords={[option.label]}
                    data-checked={option.value === selected?.value}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <OptionLabel option={option} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </Field>
  );
}
