import { Directive, input, model, Type } from '@angular/core';

@Directive()
export abstract class Base {
  data = model<any>();
  handle? = input<any>();
}

export interface AppBase {
  id: string;
  title: string;
  icon: string;
  color: string;
  component: Type<any>;
}
