import { TestBed } from '@angular/core/testing';

import { SystemTips } from './system-tips';

describe('SystemTips', () => {
  let service: SystemTips;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemTips);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
