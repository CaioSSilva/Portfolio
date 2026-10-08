import { Directive, input, model, Type } from '@angular/core';

export interface ProcessData {
  source?: { x: number; y: number };
  url?: string;
  [key: string]: string | number | boolean | { x: number; y: number } | undefined;
}

@Directive()
export abstract class Base<T = ProcessData | string> {
  readonly data = model<T | null>(null);
  readonly handle = input<string[] | undefined>();
}

export interface AppBase {
  id: string;
  title: string;
  icon: string;
  color: string;
  component: Type<Base<ProcessData | string>>;
}
