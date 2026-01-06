import { TestBed } from '@angular/core/testing';

import { TerminalComands } from './terminal-comands';

describe('TerminalComands', () => {
  let service: TerminalComands;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TerminalComands);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
