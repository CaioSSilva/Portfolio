import { TestBed } from '@angular/core/testing';

import { ProcessManager } from './process-manager';

describe('ProcessManager', () => {
  let service: ProcessManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
